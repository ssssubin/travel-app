import { Module } from "@nestjs/common";
import { DataModule } from "@data/data.module";
import { RecommendationController } from "@recomm/recommendation.controller";
import { RecommendationService } from "@recomm/recommendation.service";
import { UserModule } from "@user/user.module";
import { MainModule } from "@main/main.module";

@Module({
   imports: [DataModule, UserModule, MainModule],
   controllers: [RecommendationController],
   providers: [RecommendationService],
})
export class RecommendationModule {}
