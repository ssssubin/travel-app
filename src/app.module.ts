import { Module, OnModuleInit } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { MysqlCreateTableService } from "./data/mysql/mysql-create-table.service";
import { DataModule } from "./data/data.module";

@Module({
   imports: [
      ConfigModule.forRoot({
         envFilePath: ".env",
         isGlobal: true, // 전역 모듈로 선언
      }),
      DataModule,
   ],
   controllers: [AppController],
   providers: [AppService, MysqlCreateTableService],
})
export class AppModule implements OnModuleInit {
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
         ]);
      } catch (e) {
         console.error(e);
         throw e;
      }
   }
}
