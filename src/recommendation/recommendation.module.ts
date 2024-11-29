import { Module } from "@nestjs/common";
import { DataModule } from "src/data/data.module";
import { RecommendationController } from "./recommendation.controller";
import { RecommendationService } from "./recommendation.service";

@Module({
   imports: [DataModule],
   controllers: [RecommendationController],
   providers: [RecommendationService],
})
export class RecommendationModule {}
