import { Module } from "@nestjs/common";
import { KeywordController } from "./keyword/keyword.controller";
import { KeywordService } from "./keyword/keyword.service";
import { DataModule } from "src/data/data.module";

@Module({
   imports: [DataModule],
   controllers: [KeywordController],
   providers: [KeywordService],
})
export class RecommendationModule {}
