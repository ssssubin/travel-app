import { Injectable } from "@nestjs/common";
import { MysqlService } from "src/data/mysql/mysql.service";

@Injectable()
export class RecommendationService {
   constructor(private mysqlService: MysqlService) {}

   // 여행지별 키워드 리스트 반환하는 함수
   async destinationKeyword(keywordList: string[]) {
      // 여행지 ID와 관련 키워드 ID를 저장하는 Map 객체 생성
      const keywordMap = new Map<number, string[]>();
      // 각 키워드에 대해 관련 여행지를 비동기로 검색 후 Map 객체에 저장
      await Promise.all(
         keywordList.map(async (keyword) => {
            // 키워드들의 ID 값 조회
            const keywordId = await this.mysqlService.findKeywordIdByName(keyword);
            const id = parseInt(JSON.stringify(keywordId[0].id));
            // 키워드들의 id로 여행지 조회
            const foundDestination = await this.mysqlService.findDestinationByKeywordId(id);

            // 쿼리 결과가 배열인 경우
            if (Array.isArray(foundDestination)) {
               foundDestination.map((item) => {
                  // Map 객체에 여행지가 없는 경우, 빈 배열로 초기화
                  if (keywordMap.get(item.destination_id) === undefined) {
                     keywordMap.set(item.destination_id, []);
                  }
                  // 해당 여행지에 키워드 이름 추가
                  keywordMap.get(item.destination_id).push(keyword);
               });
            }
         }),
      );
      // Map 객체 -> 배열로 변환하여 반환
      return Array.from(keywordMap);
   }

   // 여행지별 이름, 주소, 도시, 아이디를 반환하는 함수
   async destinationList(sortedList: [number, string[]][]) {
      // 여행지 ID 리스트
      const destinationIdList = sortedList.map((value) => value[0]);
      const destination = await Promise.all(
         destinationIdList.map(async (id) => {
            // 여행지 id 사용해서 이름, 주소, 이미지, 도시 아이디 조회
            const foundDestination = await this.mysqlService.findDestinationById(id);
            return {
               name: foundDestination[0].name, // 여행지 이름
               address: foundDestination[0].address, // 여행지 주소
               cityId: foundDestination[0].city_id, // 여행지 도시 ID
            };
         }),
      );
      // 여행지 리스트 반환
      return destination;
   }

   // 여행지별 지역 반환하는 함수
   async regionList(cityIdList: number[]) {
      const region = await Promise.all(
         cityIdList.map(async (id) => {
            // 도시 아이디(city_id) 사용해서 국가, 도시 조회
            const foundRegion = await this.mysqlService.findRegionByCityId(id);
            // string으로 반환("대한민국, 서울")
            return `${foundRegion[0].country}, ${foundRegion[0].city}`;
         }),
      );

      return region;
   }

   // 여행지별 이미지 리스트 반환하는 함수(키워드 기반 API)
   async keywordImageList(sortedList: [number, string[]][]) {
      // 여행지 ID 리스트
      const destinationIdList = sortedList.map((value) => value[0]);
      // 여행지별 이미지 담을 배열 생성
      const imageList: string[][] = [];
      await Promise.all(
         destinationIdList.map(async (id) => {
            // 여행지별 이미지 조회
            const foundImage = await this.mysqlService.findImageByDestinationId(id);
            // 이미지 담을 배열 생성
            const list = [];
            // 쿼리 실행 결과가 배열인 경우
            if (Array.isArray(foundImage)) {
               foundImage.map((img) => list.push(img));
            }
            imageList.push(list);
         }),
      );

      // 여행지별 이미지 리스트 반환
      return imageList;
   }

   // 사용자가 선택한 지역에 속해있는 여행지 리스트 반환하는 함수
   async getDestination(city: string, page: number, reqPerPage: number) {
      // 도시아이디 조회
      const foundCityId = await this.mysqlService.findCityIdByName(city);
      // 여행지 조회
      const foundDestination = await this.mysqlService.findDestinationByCityId(foundCityId[0].id, page, reqPerPage);

      // 사용자가 선택한 지역에 속해있는 여행지 리스트 선언
      const destination: { id: number; name: string; address: string }[] = [];
      // 여행지 조회 결과가 배열인 경우
      if (Array.isArray(foundDestination)) {
         foundDestination.map((item) => {
            // 여행지 추가
            destination.push({
               id: item.id,
               name: item.name,
               address: item.address,
            });
         });
      }

      // 사용자가 선택한 지역에 속해있는 여행지 리스트 반환
      return destination;
   }

   // 여행지별 키워드 id 리스트 반환하는 함수
   async getKeywordId(destinationIdList: number[]) {
      // 여행지 id를 키 값으로 가지고 여행지별 키워드 id 리스트를 value로 가지는 Map 객체 선언
      const keywordIdList = new Map<number, number[]>();
      // 여행지 id를 키 값으로 가지는 Map 객체 빈 배열로 초기화
      destinationIdList.map((id) => {
         keywordIdList.set(id, []);
      });

      await Promise.all(
         destinationIdList.map(async (id) => {
            // 여행지별 키워드 id 조회
            const keywordId = await this.mysqlService.findKeywordIdByDestinationId(id);
            // 반환 결과가 배열인 경우
            if (Array.isArray(keywordId)) {
               // 여행지와 연관된 키워드 id 추가
               keywordId.map((value) => keywordIdList.get(id).push(value.keyword_id));
            }
         }),
      );

      // Map 객체 -> 배열로 변환하여 반환
      return Array.from(keywordIdList);
   }

   // 여행지별 키워드 이름 리스트 담는 배열 반환하는 함수
   async getKeywordName(keywordIdList: number[][]) {
      // 여행지별 키워드 리스트 담는 배열
      const keywordList = [];

      // keywordIdList 순회
      for (const value of keywordIdList) {
         const keywords = await Promise.all(
            // 여행지별 키워드 담을 배열 생성
            value.map(async (id) => {
               const keyword = await this.mysqlService.findKeywordNameById(id);
               return keyword[0].name;
            }),
         );

         // 여행지별 키워드 배열 추가
         keywordList.push(keywords);
      }

      // 여행지별 키워드 리스트 담는 배열 반환
      return keywordList;
   }

   // 여행지별 이미지 리스트 반환하는 함수(지역 기반 API)
   async regionImageList(destinationIdList: number[]) {
      // 여행지별 이미지 담을 배열 생성
      const imageList: string[][] = [];
      await Promise.all(
         destinationIdList.map(async (id) => {
            // 여행지별 이미지 조회
            const foundImage = await this.mysqlService.findImageByDestinationId(id);
            // 이미지 담을 배열 생성
            const list = [];
            // 쿼리 실행 결과가 배열인 경우
            if (Array.isArray(foundImage)) {
               foundImage.map((img) => list.push(img));
            }
            imageList.push(list);
         }),
      );

      // 여행지별 이미지 리스트 반환
      return imageList;
   }

   // 키워드 기반 여행지 추천 API
   async getKeyword(keyword: string, page: number) {
      const reqPerPage = 10;
      // 유저가 입력한 키워드를 공백 기준으로 분리하여 배열로 만듦
      const keywordList = keyword.split(" ");

      // 여행지별 키워드 리스트
      const keywordArr = await this.destinationKeyword(keywordList);

      // 연관 키워드가 많은 순서대로 정렬된 리스트(reqPerPage만큼 가져옴)
      const sorted = keywordArr
         .sort((a, b) => b[1].length - a[1].length)
         .slice(reqPerPage * (page - 1), reqPerPage * page);

      // 여행지별 이름, 주소, 도시 ID를 담고 있는 리스트
      const destination = await this.destinationList(sorted);

      // 여행지별 이미지 리스트
      const imageList = await this.keywordImageList(sorted);

      // 도시 ID 리스트
      const cityIdList = destination.map((value) => value.cityId);

      // 여행지별 지역 리스트
      const region = await this.regionList(cityIdList);

      // 연관 키워드가 많은 순서대로 정렬된 키워드 리스트
      const keywords = sorted.map((value) => value[1]);

      // response 데이터 배열(여행지 이름, 주소, 연관 키워드, 지역)
      const payload: {
         name: string;
         address: string;
         image: string[];
         keyword: string[];
         region: string;
      }[] = [];

      // 키워드와 연관된 여행지 개수만큼 반복문 실행
      for (let i = 0; i < cityIdList.length; i++) {
         payload.push({
            name: destination[i].name,
            address: destination[i].address,
            image: imageList[i],
            keyword: keywords[i],
            region: region[i],
         });
      }

      return { err: null, data: payload };
   }

   // 지역 기반 여행지 추천 API
   async getRegion(region: string, page: number) {
      const reqPerPage = 10;
      // 유저가 선택한 지역을 공백 기준으로 분리하여 배열로 만듦
      const regionList = region.split(" ");

      // 사용자가 선택한 지역에 속해있는 여행지 리스트(reqPerPage만큼 가져옴)
      const destinationList = await this.getDestination(regionList[regionList.length - 1], page, reqPerPage);

      // 여행지 아이디 리스트
      const destinationIdList = destinationList.map((destination) => destination.id);

      // 여행지별 키워드 id 리스트
      const keywordIdList = await this.getKeywordId(destinationIdList);
      const keywordList = keywordIdList.map((keyword) => keyword[1]);

      // 여행지별 키워드 이름 리스트
      const keyword = await this.getKeywordName(keywordList);

      // 여행지별 이미지 리스트
      const imageList = await this.regionImageList(destinationIdList);

      // response 데이터 배열(여행지 이름, 주소, 연관 키워드, 지역)
      const payload: {
         name: string;
         address: string;
         image: string[];
         keyword: string[];
         region: string;
      }[] = [];

      // 사용자가 선택한 지역에 속해 있는 여행지 개수만큼 반복문 실행
      for (let i = 0; i < keywordIdList.length; i++) {
         payload.push({
            name: destinationList[i].name,
            address: destinationList[i].address,
            image: imageList[i],
            keyword: keyword[i],
            region,
         });
      }

      return { err: null, data: payload };
   }
}
