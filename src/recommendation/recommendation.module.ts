import { Module } from "@nestjs/common";
import { KeywordController } from "./keyword/keyword.controller";
import { KeywordService } from "./keyword/keyword.service";
import { DataModule } from "src/data/data.module";
import { RegionController } from "./region/region.controller";
import { RegionService } from "./region/region.service";

@Module({
   imports: [DataModule],
   controllers: [KeywordController, RegionController],
   providers: [KeywordService, RegionService],
})
export class RecommendationModule {}
