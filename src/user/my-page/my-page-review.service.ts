import {
   BadRequestException,
   ForbiddenException,
   Injectable,
   InternalServerErrorException,
   NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import { MysqlService } from "src/data/mysql/mysql.service";
import { createReviewDto } from "./dto/create-review.dto";
import { v4 as uuidv4 } from "uuid";
import { MysqlCreateTableService } from "src/data/mysql/mysql-create-table.service";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class ReviewService {
   constructor(
      private mysqlService: MysqlService,
      private mysqlCreateService: MysqlCreateTableService,
   ) {}

   // 유효성 검증한 후, 여행지 id 반환하는 함수
   async validateData(email: string, name: string, date: string) {
      // 리뷰 작성하려는 여행지 id 조회
      const foundDestination = await this.mysqlService.findDestinationByName(name);

      // 여행지가 존재하지 않는 경우
      if (foundDestination[0] === undefined) {
         throw new NotFoundException("존재하지 않는 여행지입니다.");
      }

      // 유저가 예약한 여행지 조회
      const foundReservationDestination = await this.mysqlService.findReservationByUserEmail(email);
      if (Array.isArray(foundReservationDestination)) {
         // 유저가 예약한 여행지 id 리스트 생성
         const destinationId = foundReservationDestination.map((value) => {
            const destinationDate = `${value.format_date} ${value.day}`.split(" ");
            return {
               id: value.destination_id,
               date: `${destinationDate[0]} ${destinationDate[1]}(${destinationDate[3]})`,
            };
         });

         // 방문한 여행지인지 확인
         const isVisited = destinationId.filter((id) => id.id === foundDestination[0].id && id.date === date);

         // 방문한 여행지가 아닌 경우
         if (isVisited.length === 0) {
            throw new BadRequestException("방문하지 않은 여행지에 대해서는 리뷰를 작성할 수 없습니다.");
         }

         return foundDestination[0].id;
      }
   }

   // 이미지 서버에 업로드하는 함수
   async uploadImage(images: Express.Multer.File | null) {
      if (!images) return null;

      const uploadPath = "./uploads/reviewImages"; // 실제 저장할 디렉토리
      const tempPath = "./uploads/temp"; // 임시 저장된 디렉토리
      if (Array.isArray(images)) {
         await Promise.all(
            images.map(async (image) => {
               // 임시로 파일 저장하는 경로
               const tempfilePath = path.join(tempPath, image.filename);
               // 실제 파일 저장할 경로
               const destPath = path.join(uploadPath, image.filename);
               try {
                  // 파일 이동
                  await fs.promises.rename(tempfilePath, destPath);
               } catch (e) {
                  throw new InternalServerErrorException("파일 업로드 시 오류발생");
               } finally {
                  // 임시 폴더에 저장된 파일들 읽음
                  const files = await fs.promises.readdir(tempPath);
                  if (files.length === 0) return;
                  await Promise.all(
                     files.map(async (file) => {
                        // 임시 폴더에 저장되어있는 모든 파일 삭제
                        const tempFilePath = path.join(tempPath, file);
                        await fs.promises.unlink(tempFilePath);
                     }),
                  );
               }
            }),
         );
      }
   }

   // 리뷰 생성 API(예약한 곳에 대해서만)
   async createReview(res: Response, reviewData: createReviewDto, images: Express.Multer.File | null) {
      const connection = await this.mysqlCreateService.getConnection();
      try {
         // 유저 이메일
         const { email } = res.locals.user;
         const { name, date, rating, review } = reviewData;
         // 이미지 담는 배열 생성
         const image = [];

         if (Array.isArray(images)) {
            // 이미지가 안 들어왔을 경우, null push
            if (images.length === 0) image.push(null);
            images.map((item) => image.push(item.filename));
         }

         // 리뷰 id 생성
         const reviewId = uuidv4();

         // 트랜잭션 시작
         await connection.beginTransaction();

         // 여행지 id
         const destinationId = await this.validateData(email, name, date);

         // 방문한 여행지로 수정(status = 0 -> 1)
         await this.mysqlService.updateReservation(email, destinationId);

         // 리뷰 데이터 저장
         await this.mysqlService.createReview(reviewId, email, destinationId, rating, review);

         // 리뷰 - 이미지 데이터 저장
         await Promise.all(
            image.map(async (value) => {
               await this.mysqlService.registerReviewImage(reviewId, value);
            }),
         );

         // 이미지 업로드
         await this.uploadImage(images);

         // 트랜잭션 커밋
         await connection.commit();

         return { err: null, data: { reviewId, message: "리뷰가 작성되었습니다." } };
      } catch (e) {
         // 트랜잭션 롤백
         await connection.rollback();
         throw e; // 원래 에러를 다시 던짐
      } finally {
         // 커넥션 반환
         connection.release();
      }
   }

   // 리뷰 수정 데이터에 대한 유효성 검증하는 함수
   async validateUpdateData(email: string, date: string, reviewId: string) {
      // 유저가 방문한 여행지 조회(방문한 여행지 id, 방문 날짜)
      const foundVisitedDestination = await this.mysqlService.findVisitedDestinationByUserEmail(email);
      // 수정하려는 리뷰 조회(리뷰를 작성한 유저 이메일, 방문한 여행지 id)
      const foundReview = await this.mysqlService.findReviewByReviewId(reviewId);
      // 수정하려는 리뷰의 작성자와 수정을 요청한 유저가 다른 경우
      if (foundReview[0].user_email !== email) {
         throw new ForbiddenException("수정 권한이 없습니다.(작성자와 수정자 불일치)");
      }

      if (Array.isArray(foundVisitedDestination)) {
         // 유저가 방문한 여행지 리스트(여행지 id, 방문 날짜)
         const destinationList = foundVisitedDestination.map((destination) => {
            // 방문 날짜 배열로 생성
            const destinationDate = `${destination.format_date} ${destination.day}`.split(" ");
            return {
               id: destination.destination_id,
               date: `${destinationDate[0]} ${destinationDate[1]}(${destinationDate[2]})`,
            };
         });

         // 유저가 방문한 여행지와 수정하려는 리뷰의 여행지 일치 여부 및 방문 날짜와 리뷰의 여행지 방문 날짜 일치하는 여행지 찾음
         const isCorrect = destinationList.filter(
            (value) => value.id === foundReview[0].destination_id && value.date === date,
         );
         // 여행지가 없는 경우
         if (isCorrect.length === 0) {
            throw new BadRequestException("방문한 곳이 아니거나 방문 날짜가 일치하지 않습니다. 다시 확인해주세요.");
         }
      }
   }

   // 기존 이미지 제거하는 함수
   async removeImage(reviewId: string, images: Express.Multer.File | null) {
      if (!images) return null;

      // 리뷰 id로 리뷰 이미지 조회
      const foundReview = await this.mysqlService.findReviewImageByReviewId(reviewId);

      // 등록된 리뷰 이미지가 없는 경우
      if (foundReview[0] === undefined || foundReview[0].image === "null") return null;

      if (Array.isArray(foundReview)) {
         // 리뷰 이미지가 저장되어있는 디렉토리 경로
         const reviewImageDirPath = "./uploads/reviewImages/";
         try {
            await Promise.all(
               foundReview.map(async (image) => {
                  // 이미지 파일이 저장된 경로
                  const reviewImageFilePath = path.join(reviewImageDirPath, image.image);
                  // 이미지 파일 제거
                  await fs.promises.unlink(reviewImageFilePath);
               }),
            );
         } catch (e) {
            throw e;
         }
      }
   }

   // 리뷰 수정 API
   async updateReview(res: Response, images: Express.Multer.File | null, id: string, data: createReviewDto) {
      const connection = await this.mysqlCreateService.getConnection();
      try {
         // 유저 이메일
         const { email } = res.locals.user;
         const { date, rating, review } = data;
         // 이미지 담는 배열 생성
         const image = [];

         if (Array.isArray(images)) {
            // 이미지가 안 들어왔을 경우, null push
            if (images.length === 0) image.push(null);
            images.map((item) => image.push(item.filename));
         }

         // 작성된 리뷰가 없는 경우
         const foundReview = await this.mysqlService.isReviewByReviewId(id);

         if (foundReview[0].count === 0) {
            throw new NotFoundException("존재하지 않는 리뷰입니다.");
         }

         // 트랜잭션 시작
         await connection.beginTransaction();

         // 유효성 검증
         await this.validateUpdateData(email, date, id);

         // 기존 이미지 제거(from 서버)
         const removeImage = await this.removeImage(id, images);

         // 등록된 리뷰 이미지가 있는 경우
         if (removeImage !== null) {
            // 기존 이미지 제거(from DB)
            await this.mysqlService.deleteReviewImageByReviewId(id);
         }

         // 이미지 업로드
         await this.uploadImage(images);

         // 리뷰 - 이미지 데이터 저장
         await Promise.all(
            image.map(async (value) => {
               await this.mysqlService.registerReviewImage(id, value);
            }),
         );

         // 리뷰 수정
         await this.mysqlService.updateReviewByReviewId(id, rating, review);

         // 트랜잭션 커밋
         await connection.commit();

         return { err: null, data: { id, message: "리뷰가 수정되었습니다." } };
      } catch (e) {
         // 트랜잭션 롤백
         await connection.rollback();
         throw e;
      } finally {
         // 커넥션 반환
         connection.release();
      }
   }
}
