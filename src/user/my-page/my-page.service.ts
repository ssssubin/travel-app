import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { MysqlService } from "src/data/mysql/mysql.service";
import { MainService } from "src/main/main.service";

@Injectable()
export class MyPageService {
   constructor(
      private mysqlService: MysqlService,
      private mainService: MainService,
   ) {}

   // 마이페이지 조회 API
   async getMyPage(res: Response) {
      try {
         // 유저가 예약한 여행지 리스트
         const foundReservation = await this.mainService.getReservation(res);
         // 마이페이지 조회하려는 유저 이메일
         const { email } = res.locals.user;
         // 유저 정보 조회
         const foundUser = await this.mysqlService.findUserByEmail(email);

         // 유저 이메일, 이름 정보
         const user = { email, name: foundUser[0].name };

         // 유저가 방문한 여행지 리스트
         const foundVisitedDestination = await this.mysqlService.findVisitedDestinationByUserEmail(email);
         // 여행지 id 리스트
         const destinationIdList = Array.isArray(foundVisitedDestination)
            ? foundVisitedDestination.map((destination) => destination.destination_id)
            : [];
         // 유저가 방문한 여행지 리스트
         const destinationList = await Promise.all(
            destinationIdList.map(async (id) => {
               const destination = await this.mysqlService.findDestinationById(id);
               return destination[0].name;
            }),
         );

         // 유저가 방문한 여행지별 대표 이미지
         const mainImage = await this.mainService.mainImageByDestination(destinationIdList);
         // 유저가 방문한 여행지별 평점
         const rating = await this.mainService.ratingByDestination(destinationIdList);
         // response 데이터 배열(여행지 이름, 예약 날짜 및 시간, 별점, 유저가 작성한 리뷰)
         const payload: { image: string; name: string; date: string; rating: number; review: string | null }[] = [];

         // 유저가 방문한 여행지 id 리스트 길이만큼 반복문 실행
         for (let i = 0; i < destinationIdList.length; i++) {
            const formatDate = foundVisitedDestination[i].format_date.split(" ");
            payload.push({
               image: mainImage[i],
               date: `${formatDate[1]} ${formatDate[2]}(${foundVisitedDestination[i].day}) ${formatDate[3]}`,
               name: destinationList[i],
               rating: rating[i],
               review: foundVisitedDestination[i].content,
            });
         }
         return { err: null, data: { user, review: payload, reservation: foundReservation } };
      } catch (e) {
         throw e;
      }
   }
}
