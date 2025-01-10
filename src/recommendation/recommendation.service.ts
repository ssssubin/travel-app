import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { MysqlService } from "@data/mysql/mysql.service";
import { MyPageService } from "@mypage/my-page.service";

@Injectable()
export class RecommendationService {
   constructor(
      private mysqlService: MysqlService,
      private mypageService: MyPageService,
   ) {}

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

   // 여행지별 지역 반환하는 함수
   async destinationRegion(destinationIdList: number[]) {
      // 여행지별 도시 id 조회
      const foundDestinationCityId = await Promise.all(
         destinationIdList.map(async (id) => {
            const findCityId = await this.mysqlService.findCityIdByDestinationId(id);
            return findCityId[0].city_id;
         }),
      );

      // 도시 id로 지역 조회
      const foundDeistinationRegion: string[][] = await Promise.all(
         foundDestinationCityId.map(async (id) => {
            return await this.mypageService.getRegion(id);
         }),
      );
      return foundDeistinationRegion;
   }

   // 사용자가 선택한 키워드 id 리스트와 검색한 여행지의 키워드 id 리스트 반환하는 함수
   async userAndSearchKeywordList(email: string, destinationIdList: number[]) {
      // KEY : 여행지 id, VALUE - 키워드 id[]를 가지는 MAP 객체
      const destinationId = new Map<number, number[]>();
      // 사용자가 선택한 키워드 id 조회
      const foundUserKeywordId = await this.mysqlService.findKeywordIdByUserEmail(email);
      // 검색한 여행지의 키워드 id 조회
      await Promise.all(
         destinationIdList.map(async (id) => {
            // 여행지 id로 키워드 id 조회
            const keywordId = await this.mysqlService.findKeywordIdByDestinationId(id);
            if (Array.isArray(keywordId)) {
               // 키워드 id 길이가 0이면 빈 배열 반환
               if (keywordId.length === 0) return [];
               // key가 여행지 id인 값이 없으면 빈 배열로 초기화
               if (destinationId.get(id) === undefined) destinationId.set(id, []);
               keywordId.map((keyword) => destinationId.get(id).push(keyword.keyword_id));
            }
         }),
      );

      return {
         keywordIdList: Array.isArray(foundUserKeywordId) ? foundUserKeywordId.map((id) => id.keyword_id) : [],
         destinationIdList: Array.from(destinationId),
      };
   }

   // 검색지의 키워드 배열을 벡터로 변환하는 함수
   keywordsToVector(keywordList: number[], idList: number[]) {
      // 전체 키워드 리스트에 검색지의 키워드가 존재하면 1
      // 없으면 0 반환
      return keywordList.map((id) => (idList.includes(id) ? 1 : 0));
   }

   // 두 벡터 간의 코사인 유사도 계산하는 함수
   cosineSimilarity(vectorA: number[], vectorB: number[]) {
      // 벡터 A와 벡터 B의 내적 계산
      const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);

      // 벡터 A의 크기 계산
      const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
      // 벡터 B의 크기 계산
      const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
      // 벡터 크기가 0인 경우 유사도 계산 불가 -> 0 반환
      if (magnitudeA === 0 || magnitudeB === 0) return 0;
      // 코사인 유사도 계산 및 반환
      return dotProduct / (magnitudeA * magnitudeB);
   }

   // 사용자 지역과 검색한 여행지 지역의 유사도 계산하는 함수
   calculateRegionSimilarity(userRegion: string[], destinationRegion: string[]) {
      // 비교할 최대 레벨 결정
      // 빈 배열일 경우 연산 결과를 0으로 반환
      if (userRegion.length === 0 || destinationRegion.length === 0) return 0;

      // 공통 지역 개수 계산하는 변수 초기화
      let commonLevel = 0;
      for (let i = 0; i < 3; i++) {
         // 사용자 지역과 여행지 지역이 일치하는 경우
         if (userRegion[i] === destinationRegion[i]) commonLevel++;
         else break;
      }
      return commonLevel / 3;
   }

   // 유사도 계산하여 반환하는 함수
   async calculateSimilarity(email: string, foundDestinationIdList: number[]) {
      // 사용자 이메일로 사용자 정보 조회
      const foundUser = await this.mysqlService.findUserByEmail(email);

      // 키워드 전체 id 리스트
      const keywordList = [];
      const getKeywordList = await this.mysqlService.getKeyword();
      if (Array.isArray(getKeywordList)) {
         getKeywordList.map((keyword) => keywordList.push(keyword.id));
      }

      // 사용자가 선택한 키워드 id 리스트와 사용자가 선택한 키워드를 가진 여행지 리스트
      const { keywordIdList, destinationIdList } = await this.userAndSearchKeywordList(email, foundDestinationIdList);

      // 사용자 지역 조회
      const userRegion = await this.mypageService.getRegion(foundUser[0].city_id);
      // 검색한 여행지 지역 리스트
      const searchRegion = await this.destinationRegion(foundDestinationIdList);

      // 사용자 키워드 벡터 생성
      const keywordToVector = this.keywordsToVector(keywordList, keywordIdList);
      // 검색한 지역 키워드 벡터 생성
      const regionToVector = destinationIdList.map((region) => this.keywordsToVector(keywordList, region[1]));

      // 키워드 유사도 계산
      const keywordSimilarity = regionToVector.map((region) => this.cosineSimilarity(keywordToVector, region));
      // 지역 유사도 계산
      const regionSimilarity = searchRegion.map((region) => this.calculateRegionSimilarity(userRegion, region));

      // 가중치 적용하여 최종 계산
      const keywordWeight = 0.7;
      const regionWeight = 0.3;
      const finalSimlarity = [];
      for (let i = 0; i < foundDestinationIdList.length; i++) {
         finalSimlarity.push(
            parseFloat((keywordSimilarity[i] * keywordWeight + regionSimilarity[i] * regionWeight).toFixed(3)),
         );
      }
      // 최종 유사도 반환
      return finalSimlarity;
   }

   // 검색 API
   async search(res: Response, search: string) {
      try {
         // 사용자 이메일
         const { email } = res.locals.user;
         // 사용자가 검색한 내용
         const searchList = search.split(" ");
         // 사용자가 검색한 내용으로 조회한 여행지 id 리스트
         const foundDestinationIdList = [];
         await Promise.all(
            searchList.map(async (search) => {
               const destinationIdList = await this.mysqlService.findDestinationBySearch(search);
               if (Array.isArray(destinationIdList)) {
                  destinationIdList.map((id) => foundDestinationIdList.push(id.id));
               }
            }),
         );

         // 여행지 id 중복 제거
         const destinationIdList = Array.from(new Set(foundDestinationIdList));

         // 여행지 리스트(이름, 주소)
         const destinationList = await Promise.all(
            destinationIdList.map(async (id) => {
               const foundDestination = await this.mysqlService.findDestinationById(id);
               return { name: foundDestination[0].name, address: foundDestination[0].address };
            }),
         );

         // 검색한 여행지별 키워드 리스트
         const keywordIdList = await this.getKeywordId(destinationIdList);
         const keywordList = keywordIdList.map((keyword) => keyword[1]);

         // 여행지별 키워드 이름 리스트
         const keyword = await this.getKeywordName(keywordList);

         // 여행지별 이미지 리스트
         const imageList = await this.regionImageList(destinationIdList);

         // 여행지별 지역 리스트
         const foundDestinationRegion = await this.destinationRegion(destinationIdList);

         // 유사도 계산
         const calculateSimilarity = await this.calculateSimilarity(email, destinationIdList);

         // response 데이터 배열(여행지 이름, 주소, 연관 키워드, 지역)
         const payload: {
            name: string;
            address: string;
            image: string[];
            keyword: string[];
            region: string;
            similary: number;
         }[] = [];

         // 검색된 여행지 수만큼 반복문 실행
         for (let i = 0; i < destinationIdList.length; i++) {
            payload.push({
               name: destinationList[i].name,
               address: destinationList[i].address,
               image: imageList[i],
               keyword: keyword[i],
               region: `${foundDestinationRegion[i][1]}, ${foundDestinationRegion[i][2]}`,
               similary: calculateSimilarity[i],
            });
         }

         const sortedArr = payload.sort((a, b) => b.similary - a.similary).map(({ similary, ...value }) => value);

         // 유사도 높은 순으로 데이터 응답
         return { err: null, data: Array.from(new Set(sortedArr)) };
      } catch (e) {
         throw e;
      }
   }
}
