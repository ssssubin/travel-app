import { MiddlewareConsumer, Module, NestModule, OnModuleInit } from "@nestjs/common";
import { AppController } from "@src/app.controller";
import { AppService } from "@src/app.service";
import { ConfigModule } from "@nestjs/config";
import { MysqlCreateTableService } from "@data/mysql/mysql-create-table.service";
import { DataModule } from "@data/data.module";
import { RecommendationModule } from "@recomm/recommendation.module";
import { JwtModule } from "@nestjs/jwt";
import { MainModule } from "@main/main.module";
import { AuthenticationMiddleware } from "@srccommon/middleware/authentication.middleware";
import { UserModule } from "@user/user.module";

@Module({
   imports: [
      ConfigModule.forRoot({
         envFilePath: ".env",
         isGlobal: true, // 전역 모듈로 선언
      }),
      DataModule,
      RecommendationModule,
      UserModule,
      JwtModule.registerAsync({
         useFactory: async () => ({
            secret: process.env.USER_SECRET_KEY,
            signOptions: { expiresIn: "1h" },
            global: true,
         }),
      }),
      MainModule,
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule implements OnModuleInit, NestModule {
   constructor(private createTableService: MysqlCreateTableService) {}

   // 서버 시작될 때 테이블 생성
   async onModuleInit() {
      try {
         await Promise.all([
            this.createTableService.createContinentTable(),
            this.createTableService.createCountryTable(),
            this.createTableService.createCityTable(),
            this.createTableService.createUserTable(),
            this.createTableService.createDestinationTable(),
            this.createTableService.createKeywordTable(),
            this.createTableService.createUserKeywordTable(),
            this.createTableService.createDestinationKeywordTable(),
            this.createTableService.createDestiantionImageTable(),
            this.createTableService.createDestinationInformationTable(),
            this.createTableService.createReservationTable(),
            this.createTableService.createReviewTable(),
            this.createTableService.createEventScheduler(),
            this.createTableService.createReviewImageTable(),
         ]);
      } catch (e) {
         console.error(e);
         throw e;
      }
   }

   // 미들웨어 적용
   configure(consumer: MiddlewareConsumer) {
      consumer
         .apply(AuthenticationMiddleware)
         .forRoutes("main", "keyword", "region", "sign-out", "my-page", "recommendation", "review");
   }
}
