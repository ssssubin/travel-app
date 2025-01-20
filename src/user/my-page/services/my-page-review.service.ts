import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { MysqlService } from "@data/mysql/mysql.service";
import { createReviewDto } from "@mypage/dto/create-review.dto";
import { v4 as uuidv4 } from "uuid";
import { MysqlCreateTableService } from "@data/mysql/mysql-create-table.service";
import * as path from "path";
import * as AWS from "aws-sdk";

@Injectable()
export class ReviewService {
   private readonly awsS3: AWS.S3;
   public readonly S3_BUCKET_NAME: string;

   constructor(
      private mysqlService: MysqlService,
      private mysqlCreateService: MysqlCreateTableService,
   ) {
      this.awsS3 = new AWS.S3({
         accessKeyId: process.env.AWS_S3_ACCESS_KEY,
         secretAccessKey: process.env.AWS_S3_SECRET_KEY,
         region: process.env.AWS_S3_REGION,
      });
      this.S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
   }

   // 유효성 검증한 후, 예약 id & 예약한 여행지 id 반환하는 함수
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
               id: value.id,
               destination_id: value.destination_id,
               date: `${destinationDate[0]} ${destinationDate[1]}(${destinationDate[3]})`,
            };
         });

         // 예약 날짜와 방문 날짜가 일치하는지 확인
         const isVisited = destinationId.filter(
            (id) => id.destination_id === foundDestination[0].id && id.date === date,
         );

         // 예약 날짜와 방문 날짜가 일치하지 않는 경우
         if (isVisited.length === 0) {
            throw new BadRequestException("방문하지 않은 여행지에 대해서는 리뷰를 작성할 수 없습니다.");
         }

         return { reservationId: isVisited[0].id, destinationId: isVisited[0].destination_id };
      }
   }

   // 이미지 S3에 업로드 하는 함수
   async uploadImage(email: string, images: Express.Multer.File[]) {
      if (images.length === 0) return [null];
      const result: string[] = [];
      // replace(/ /g, "") -> 모든 공백 지움
      for (const image of images) {
         const key = `${email}/review/${Date.now()}_${path.basename(image.originalname)}`.replace(/ /g, "");
         result.push(key);
         await this.awsS3
            .putObject({
               Bucket: this.S3_BUCKET_NAME,
               Key: key,
               Body: image.buffer,
               ACL: "public-read",
               ContentType: image.mimetype,
            })
            .promise();
      }

      return result;
   }

   // 리뷰 조회하는 함수
   async getReview(res: Response) {
      try {
         const { email } = res.locals.user;
         // 유저가 작성한 리뷰 리스트(리뷰 id, 여행지 id, 별점, 리뷰내용, 예약 id)
         const foundReview = await this.mysqlService.findReviewByUserEmail(email);
         // 리뷰를 작성한 여행지 id 리스트
         const reviewList = Array.isArray(foundReview) ? foundReview.map((review) => review) : [];
         // 여행지명 리스트
         const destinationList = await Promise.all(
            reviewList.map(async (review) => {
               const destination = await this.mysqlService.findDestinationById(review.destination_id);
               return destination[0].name;
            }),
         );

         // 리뷰 리스트(방문날짜, 평점, 리뷰 내용)
         const foundReservation = await Promise.all(
            reviewList.map(async (review) => {
               // 예약 id로 방문 날짜 조회
               const foundDate = await this.mysqlService.findResevationById(review.reservation_id);
               const visitedDate = `${foundDate[0].format_date} ${foundDate[0].day}`.split(" ");

               return {
                  date: `${visitedDate[0]} ${visitedDate[1]}(${visitedDate[3]}) ${visitedDate[2]}`,
                  rating: review.rating,
                  content: review.content,
               };
            }),
         );

         // 응답 데이터 : 작성 리뷰의 여행지명, 방문 날짜, 평점, 리뷰 내용
         const payload: { name: string; visitedDate: string; rating: number; review: string }[] = destinationList.map(
            (name, index) => {
               return {
                  name,
                  visitedDate: foundReservation[index].date,
                  rating: foundReservation[index].rating,
                  review: foundReservation[index].content,
               };
            },
         );
         return payload;
      } catch (e) {
         throw e;
      }
   }

   // 리뷰 생성 API(예약한 곳에 대해서만)
   async createReview(res: Response, reviewData: createReviewDto, images: Express.Multer.File[]) {
      const connection = await this.mysqlCreateService.getConnection();
      try {
         // 유저 이메일
         const { email } = res.locals.user;
         const { name, date, rating, review } = reviewData;

         // 리뷰 id 생성
         const reviewId = uuidv4();

         // 트랜잭션 시작
         await connection.beginTransaction();

         // 예약 id, 예약한 여행지 id
         const { reservationId, destinationId } = await this.validateData(email, name, date);

         // 방문한 여행지로 수정(status = 0 -> 1)
         await this.mysqlService.updateReservation(reservationId);

         // 리뷰 데이터 저장
         await this.mysqlService.createReview(reviewId, email, destinationId, rating, review, reservationId);

         // 이미지 업로드
         const imagePathList = await this.uploadImage(email, images);

         // 리뷰 - 이미지 데이터 저장
         await Promise.all(
            imagePathList.map(async (image) => {
               await this.mysqlService.registerReviewImage(reviewId, image);
            }),
         );

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

   // AWS S3에 저장된 이미지 삭제하는 함수
   async removeImage(id: string, callback?: (err: AWS.AWSError, data: AWS.S3.DeleteObjectOutput) => void) {
      const foundReviewImage = await this.mysqlService.findReviewImageByReviewId(id);
      if (Array.isArray(foundReviewImage)) {
         foundReviewImage
            .map((image) => image.image)
            .forEach(async (imagePath) => {
               await this.awsS3
                  .deleteObject(
                     {
                        Bucket: this.S3_BUCKET_NAME,
                        Key: imagePath,
                     },
                     callback,
                  )
                  .promise();
            });
      }
   }

   // 리뷰 수정 API
   async updateReview(res: Response, images: Express.Multer.File[], id: string, data: createReviewDto) {
      const connection = await this.mysqlCreateService.getConnection();
      try {
         // 유저 이메일
         const { email } = res.locals.user;
         const { date, rating, review } = data;

         // 작성된 리뷰가 없는 경우
         const foundReview = await this.mysqlService.isReviewByReviewId(id);

         if (foundReview[0].count === 0) {
            throw new NotFoundException("존재하지 않는 리뷰입니다.");
         }

         // 트랜잭션 시작
         await connection.beginTransaction();

         // 유효성 검증
         await this.validateUpdateData(email, date, id);

         // 기존 이미지 제거(from S3)
         await this.removeImage(id);

         // 기존 이미지 제거(from DB)
         await this.mysqlService.deleteReviewImageByReviewId(id);

         // 이미지 업로드
         const imagePathList = await this.uploadImage(email, images);

         // 리뷰 - 이미지 데이터 저장
         await Promise.all(
            imagePathList.map(async (image) => {
               await this.mysqlService.registerReviewImage(id, image);
            }),
         );

         // 리뷰 수정
         await this.mysqlService.updateReviewByReviewId(id, rating, review);

         // 트랜잭션 커밋
         await connection.commit();

         return { err: null, data: { reviewId: id, message: "리뷰가 수정되었습니다." } };
      } catch (e) {
         // 트랜잭션 롤백
         await connection.rollback();
         throw e;
      } finally {
         // 커넥션 반환
         connection.release();
      }
   }

   /**
    * 리뷰 삭제 API
    * DB와 서버에서 이미지 삭제
    */
   async removeReview(res: Response, id: string) {
      const connection = await this.mysqlCreateService.getConnection();
      try {
         // 유저 이메일
         const { email } = res.locals.user;
         // 리뷰 조회
         const foundReview = await this.mysqlService.findReviewByReviewId(id);
         // 리뷰가 존재하지 않는 경우
         if (foundReview[0] === undefined) {
            throw new NotFoundException("리뷰가 존재하지 않습니다.");
         }

         // 작성자와 삭제하려는 사람이 다른 경우
         if (foundReview[0].user_email !== email) {
            throw new ForbiddenException("삭제 권한이 없습니다.");
         }
         // 리뷰 - 이미지 삭제(in S3)
         await this.removeImage(id);
         // 트랜잭션 시작
         await connection.beginTransaction();
         // 리뷰 - 이미지 삭제(in DB)
         await this.mysqlService.deleteReviewImageByReviewId(id);
         // 리뷰 삭제
         await this.mysqlService.deleteReviewByReviewId(id);

         // 트랜잭션 커밋
         await connection.commit();
         return;
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
