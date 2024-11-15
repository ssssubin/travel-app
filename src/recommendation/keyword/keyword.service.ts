import { Injectable } from "@nestjs/common";
import { MysqlService } from "src/data/mysql/mysql.service";

@Injectable()
export class KeywordService {
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
               name: foundDestination[0].name,
               address: foundDestination[0].address,
               image: foundDestination[0].image,
               cityId: foundDestination[0].city_id,
            };
         }),
      );
      return destination;
   }

   // 여행지별 지역 반환하는 함수
   async regionList(cityIdList: number[]) {
      const region = await Promise.all(
         cityIdList.map(async (id) => {
            // 도시 아이디(city_id) 사용해서 국가, 도시 조회
            const foundRegion = await this.mysqlService.findRegionByCityId(id);
            return `${foundRegion[0].country}, ${foundRegion[0].city}`;
         }),
      );
      return region;
   }

   // 여행지별 이미지 반환하는 함수
   async imageList(sortedList: [number, string[]][]) {
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

   // 키워드 기반 여행지 추천 API
   async getKeyword(keyword: string) {
      // 유저가 입력한 키워드를 공백 기준으로 분리하여 배열로 만듦
      const keywordList = keyword.split(" ");

      // 여행지별 키워드 리스트
      const keywordArr = await this.destinationKeyword(keywordList);

      // 연관 키워드가 많은 순서대로 정렬된 리스트
      const sorted = keywordArr.sort((a, b) => b[1].length - a[1].length);

      // 여행지별 이름, 주소, 도시 ID를 담고 있는 리스트
      const destination = await this.destinationList(sorted);

      // 여행지별 이미지 리스트
      const imageList = await this.imageList(sorted);

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
}
