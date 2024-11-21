import { Controller, Get, Query } from "@nestjs/common";
import { RegionService } from "./region.service";

@Controller("region")
export class RegionController {
   constructor(private regionService: RegionService) {}

   @Get()
   async getRegion(@Query("region") region: string, @Query("page") page: number) {
      return await this.regionService.getRegion(region, page);
   }
}
