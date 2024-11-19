import { Module } from "@nestjs/common";
import { MysqlService } from "./mysql/mysql.service";
import { MysqlCreateTableService } from "./mysql/mysql-create-table.service";

@Module({
   providers: [MysqlService, MysqlCreateTableService],
   exports: [MysqlService, MysqlCreateTableService],
})
export class DataModule {}
