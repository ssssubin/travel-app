import { Injectable } from "@nestjs/common";
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

   // 조회한 여행지의 도시 id로 지역 반환하는 함수
   async destinationRegion(cityId: number) {
      const foundRegion = await this.mysqlService.findRegionByCityId(cityId);
      return `${foundRegion[0].country}, ${foundRegion[0].city}`;
   }

   // 프로모션 API
   async getPromotion() {
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
      // 조회한 여행지의 도시 id로 지역 조회
      const region = await this.destinationRegion(foundDestination[0].city_id);

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
   }
}
