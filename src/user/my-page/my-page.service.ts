import { Injectable, NotFoundException } from "@nestjs/common";
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
               date: `${formatDate[0]} ${formatDate[1]}(${foundVisitedDestination[i].day})`,
               name: destinationList[i],
               rating: rating[i],
               review: foundVisitedDestination[i].content,
            });
         }
         return { err: null, data: { review: payload, reservation: foundReservation } };
      } catch (e) {
         throw e;
      }
   }

   // 유저가 선택한 키워드 리스트 반환하는 함수
   async keywordList(email: string) {
      // 유저 이메일로 유저가 선택한 키워드 id 리스트 조회
      const foundKeywordId = await this.mysqlService.findKeywordIdByUserEmail(email);
      if (Array.isArray(foundKeywordId)) {
         const keywordList: string[] = await Promise.all(
            foundKeywordId.map(async (id) => {
               const foundKeyword = await this.mysqlService.findKeywordNameById(id.keyword_id);
               return id.keyword_id === null ? null : foundKeyword[0].name;
            }),
         );
         return keywordList;
      }
   }

   // 유저가 속해있는 리전 반환하는 함수
   async getRegion(cityId: number) {
      // 도시 이름, 국가 id 조회
      const foundCity = await this.mysqlService.findCityById(cityId);
      // 국가 id로 국가 이름, 대륙 이름 조회
      const foundContinentAndCountry = await this.mysqlService.findContinentAndCountryNameByCountryId(
         foundCity[0].country_id,
      );
      // 유저가 속한 리전 = ["대륙", "국가", "도시"]
      const region: string[] = [
         foundContinentAndCountry[0].continent_name,
         foundContinentAndCountry[0].country_name,
         foundCity[0].name,
      ];

      return region;
   }

   // 프로필 조회 API
   async getProfile(res: Response) {
      try {
         const { email } = res.locals.user;
         // 유저 정보 조회
         const foundUser = await this.mysqlService.findUserByEmail(email);
         // 유저 존재 여부 확인
         if (foundUser[0] === undefined) {
            throw new NotFoundException("존재하지 않는 유저입니다.");
         }

         // 유저가 선택한 키워드 리스트
         const keywordList = await this.keywordList(email);

         // 유저가 속해있는 region
         const region = await this.getRegion(foundUser[0].city_id);

         return {
            err: null,
            data: {
               user: {
                  email,
                  name: foundUser[0].name,
                  image: foundUser[0].image,
                  continent: region[0],
                  country: region[1],
                  city: region[2],
               },
               keyword: keywordList,
            },
         };
      } catch (e) {
         throw e;
      }
   }

   // 키워드 수정 API
   async updateKeyword(res: Response, keyword: string[]) {
      try {
         // 유저 이메일
         const { email } = res.locals.user;
         // 요청 받은 키워드 담는 배열 생성
         const keywordList = [];

         // 키워드가 아무것도 오지 않았을 경우, null로 채움
         if (keyword.length === 0) {
            keywordList.push(null, null, null, null, null);
         }

         // 들어온 키워드들 배열에 담고 5개보다 적게 들어왔을 경우,
         // 5 - 요청 받은 키워드 길이만큼 null로 채움
         keyword.map((value) => keywordList.push(value));
         for (let i = 0; i < 5 - keyword.length; i++) {
            keywordList.push(null);
         }
         // 키워드 id 리스트
         const keywordIdList = await Promise.all(
            keywordList.map(async (keyword) => {
               // 키워드 이름으로 키워드 id 조회
               const foundKeywordId = await this.mysqlService.findKeywordIdByName(keyword);
               // 키워드 이름이 null이 아니면서 키워드 id 조회 결과가 없는 경우
               if (foundKeywordId[0] === undefined && keyword !== null) {
                  throw new NotFoundException("존재하지 않는 키워드입니다.");
               }
               // 키워드가 null이면 null 반환
               // 아니면 키워드 id 반환
               return keyword === null ? null : foundKeywordId[0].id;
            }),
         );

         // 유저가 선택한 기존 키워드 삭제
         await this.mysqlService.deleteUserKeyword(email);
         await Promise.all(
            keywordIdList.map(async (id) => {
               // 유저가 변경한 키워드로 업데이트
               await this.mysqlService.updateUserKeyword(email, id);
            }),
         );

         return { err: null, data: "키워드가 수정되었습니다." };
      } catch (e) {
         throw e;
      }
   }
}
