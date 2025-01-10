import { Module } from "@nestjs/common";
import { DataModule } from "@data/data.module";
import { RecommendationController } from "@recomm/recommendation.controller";
import { RecommendationService } from "@recomm/recommendation.service";
import { UserModule } from "@user/user.module";

@Module({
   imports: [DataModule, UserModule],
   controllers: [RecommendationController],
   providers: [RecommendationService],
})
export class RecommendationModule {}
