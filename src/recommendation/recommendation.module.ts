import { Module } from "@nestjs/common";
import { DataModule } from "src/data/data.module";
import { RecommendationController } from "./recommendation.controller";
import { RecommendationService } from "./recommendation.service";
import { UserModule } from "src/user/user.module";

@Module({
   imports: [DataModule, UserModule],
   controllers: [RecommendationController],
   providers: [RecommendationService],
})
export class RecommendationModule {}
