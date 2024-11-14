import { Module } from "@nestjs/common";
import { MysqlService } from "./mysql/mysql.service";

@Module({
   providers: [MysqlService],
   exports: [MysqlService],
})
export class DataModule {}
