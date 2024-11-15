import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { DataModule } from "src/data/data.module";

@Module({
   imports: [DataModule],
   controllers: [AccountController],
   providers: [AccountService],
})
export class AccountModule {}
