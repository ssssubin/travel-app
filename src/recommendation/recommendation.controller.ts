import { Controller, Get, Query, Res } from "@nestjs/common";
import { RecommendationService } from "./recommendation.service";
import { Response } from "express";

@Controller("recommendation")
export class RecommendationController {
   constructor(private recommendationService: RecommendationService) {}

   // 키워드 기반 여행지 추천 API
   @Get("keyword")
   async getKeywordRecommendation(@Query("keyword") keyword: string, @Query("page") page: number) {
      return await this.recommendationService.getKeyword(keyword, page);
   }

   // 지역 기반 여행지 추천 API
   @Get("region")
   async getRegion(@Query("region") region: string, @Query("page") page: number) {
      return await this.recommendationService.getRegion(region, page);
   }

   // 검색 API
   @Get("search")
   async search(@Res({ passthrough: true }) res: Response, @Query("search") search: string) {
      return await this.recommendationService.search(res, search);
   }
}
