import { Module } from "@nestjs/common";
import { MysqlService } from "@data/mysql/mysql.service";
import { MysqlCreateTableService } from "@data/mysql/mysql-create-table.service";

@Module({
   providers: [MysqlService, MysqlCreateTableService],
   exports: [MysqlService, MysqlCreateTableService],
})
export class DataModule {}
