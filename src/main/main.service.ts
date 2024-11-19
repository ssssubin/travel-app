import { Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { MysqlService } from "src/data/mysql/mysql.service";

@Injectable()
export class MainService {
   constructor(private mysqlService: MysqlService) {}

   // 여행지의 키워드 리스트 반환하는 함수
   async destinationKeywordList(destinationId: number) {
      // 여행지 id로 키워드 id 조회
      const foundKeywordId = await this.mysqlService.findKeywordIdByDestinationId(destinationId);
      // 조회한 키워드 id 리스트 생성
      const keywordId: number[] = [];
      if (Array.isArray(foundKeywordId)) {
         foundKeywordId.map((id) => {
            keywordId.push(id.keyword_id);
         });
      }

      // 키워드 이름 담는 리스트 생성
      const keyword: string[] = [];
      await Promise.all(
         keywordId.map(async (id) => {
            // 키워드 id로 키워드 이름 조회
            const foundKeywordName = await this.mysqlService.findKeywordNameById(id);
            if (Array.isArray(foundKeywordName)) {
               foundKeywordName.map((name) => {
                  keyword.push(name.name);
               });
            }
         }),
      );

      // 키워드 리스트 반환
      return keyword;
   }

   // 프로모션 API
   async getPromotion() {
      try {
         // db에 저장된 여행지 개수
         const destinationCount = await this.mysqlService.findNumberOfDestinations();
         // 랜덤으로 여행지 id 생성
         const randomDestinationId = Math.floor(Math.random() * destinationCount[0].count) + 1;
         // 랜덤으로 생성한 여행지 id로 여행지(이름, 주소, 도시 ID) 조회
         const foundDestination = await this.mysqlService.findDestinationById(randomDestinationId);
         // 랜덤으로 조회한 여행지 키워드 리스트
         const keywordList = await this.destinationKeywordList(randomDestinationId);
         // 랜덤으로 생성된 여행지 id로 이미지 조회
         const foundImage = await this.mysqlService.findImageByDestinationId(randomDestinationId);
         // 도시 id로 국가 이름, 도시 이름 조회
         const foundRegion = await this.mysqlService.findRegionByCityId(foundDestination[0].city_id);
         // 조회한 지역을 string으로 변환
         const region = `${foundRegion[0].country}, ${foundRegion[0].city}`;

         return {
            err: null,
            data: {
               image: foundImage[0].image,
               name: foundDestination[0].name,
               address: foundDestination[0].address,
               keyword: keywordList,
               region,
               promotion: true,
            },
         };
      } catch (e) {
         throw e;
      }
   }

   // 도시 id로 조회한 여행지 리스트 반환하는 함수
   async destinationList(cityId: number) {
      // 도시 id로 여행지 id, 이름, 주소 조회
      const foundDestination = await this.mysqlService.findDestinationByCityId(cityId);
      if (Array.isArray(foundDestination)) {
         const destinationList = foundDestination.map((destination) => {
            return { id: destination.id, name: destination.name, address: destination.address };
         });
         return destinationList;
      }
   }

   // 여행지별 대표 이미지 반환하는 함수
   async mainImageByDestination(destinationIdList: number[]) {
      // 여행지별 이미지 리스트
      const imageList = await Promise.all(
         destinationIdList.map(async (id) => {
            return await this.mysqlService.findImageByDestinationId(id);
         }),
      );
      // 여행지별 대표 이미지 담을 리스트 생성
      const mainImage: string[] = imageList.map((image) => image[0].image);
      return mainImage;
   }

   // 여행지별 평점 반환하는 함수
   async ratingByDestination(destinationIdList: number[]) {
      const ratingList = await Promise.all(
         destinationIdList.map(async (id) => {
            // 여행지별 평점 반환
            return await this.mysqlService.findDestinationInformationById(id);
         }),
      );

      // 평점 값만 담는 배열 생성
      const rating: number[] = ratingList.map((item) => item[0].star_point_average);

      // 여행지별 평점 반환
      return rating;
   }

   // 유저가 속한 지역의 여행지 조회 API
   async getDestinationInUserRegion(res: Response, email: string) {
      try {
         // 유저 조회
         const foundUser = await this.mysqlService.findUserByEmail(email);
         if (foundUser[0] === undefined) {
            throw new NotFoundException("존재하지 않는 유저입니다.");
         }

         // 유저가 속해 있는 도시
         const city = await this.mysqlService.findCityNameById(foundUser[0].city_id);

         // 여행지 리스트
         const destinationList = await this.destinationList(foundUser[0].city_id);
         // 여행지 id 리스트
         const destinationIdList = destinationList.map((destination) => destination.id);

         // 여행지별 키워드 리스트
         const keywordList = await Promise.all(
            destinationIdList.map(async (id) => {
               return await this.destinationKeywordList(id);
            }),
         );

         // 여행지별 대표 이미지
         const mainImage = await this.mainImageByDestination(destinationIdList);

         // 평점 리스트
         const rating = await this.ratingByDestination(destinationIdList);

         // response 데이터 배열(여행지 대표 이미지, 이름, 주소, 연관 키워드, 평점)
         const payload: {
            image: string;
            name: string;
            address: string;
            keyword: string[];
            rating: number;
         }[] = [];

         // 여행지 id 리스트 길이만큼 반복문 실행하여 response 데이터 가공
         for (let i = 0; i < destinationIdList.length; i++) {
            payload.push({
               image: mainImage[i],
               name: destinationList[i].name,
               address: destinationList[i].address,
               keyword: keywordList[i],
               rating: rating[i],
            });
         }

         // 평점 높은 순으로 정렬
         const resData = payload.sort((a, b) => b.rating - a.rating);
         res.statusCode = 200;
         return { err: null, data: { region: city[0].name, payload: resData } };
      } catch (e) {
         throw e;
      }
   }

   // 유저가 예약한 여행지 리스트 & 예약 시간 리스트 반환하는 함수
   async resevationInformation(email: string) {
      // 유저가 예약한 정보(최근에 주문한 순으로 반환)
      const foundReservation = await this.mysqlService.findReservationByUserEmail(email);
      if (Array.isArray(foundReservation)) {
         // 유저가 예약한 여행지 id 리스트
         const destinationIdList: number[] = foundReservation.map((reservation) => reservation.destination_id);
         // 유저가 예약한 시간 리스트
         const reservationDateList: string[] = foundReservation.map((reservation) => {
            const date = reservation.format_date.split(" ");
            const day = reservation.day;

            return `${date[0]} ${date[1]} ${date[2]}(${day}) ${date[3]}`;
         });
         return { destinationIdList, reservationDateList };
      }
   }

   // 예약한 여행지 조회 API
   async getReservation(res: Response, email: string) {
      // 유저 존재 여부 확인
      const foundUser = await this.mysqlService.isDuplicateEmail(email);
      if (foundUser[0].count === 0) {
         throw new NotFoundException("존재하지 않는 유저입니다.");
      }
      // 유저가 예약한 여행지 id 리스트 & 예약 시간 리스트
      const { destinationIdList, reservationDateList } = await this.resevationInformation(email);

      // 예약한 정보가 없으면 빈 배열 반환
      if (destinationIdList.length === 0) {
         res.statusCode = 200;
         return { err: null, data: [] };
      }

      // 여행지 리스트(이름, 주소)
      const destinationList = await Promise.all(
         destinationIdList.map(async (id) => {
            const foundDestination = await this.mysqlService.findDestinationById(id);
            return { name: foundDestination[0].name, address: foundDestination[0].address };
         }),
      );

      // 여행지별 키워드 리스트
      const keywordList = await Promise.all(
         destinationIdList.map(async (id) => {
            return await this.destinationKeywordList(id);
         }),
      );

      // 여행지별 대표 이미지
      const mainImage = await this.mainImageByDestination(destinationIdList);

      // response 데이터 배열(여행지 이미지, 이름, 주소, 예약 시간, 연관 키워드)
      const payload: { image: string; name: string; address: string; reservationDate: any; keyword: string[] }[] = [];

      // 여행지 id 리스트 길이만큼 반복하여 데이터 가공
      for (let i = 0; i < destinationIdList.length; i++) {
         payload.push({
            image: mainImage[i],
            name: destinationList[i].name,
            address: destinationList[i].address,
            reservationDate: reservationDateList[i],
            keyword: keywordList[i],
         });
      }
      res.statusCode = 200;
      return { err: null, data: payload };
   }
}
