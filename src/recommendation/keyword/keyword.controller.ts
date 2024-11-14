import { Controller, Get, Query } from "@nestjs/common";
import { KeywordService } from "./keyword.service";

@Controller("keyword")
export class KeywordController {
   constructor(private keywordService: KeywordService) {}

   // 키워드 기반 여행지 추천 API
   @Get()
   async getKeywordRecommendation(@Query("keyword") keyword: string) {
      return await this.keywordService.getKeyword(keyword);
   }
}
