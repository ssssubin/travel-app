import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { DataModule } from "src/data/data.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
   imports: [DataModule, JwtModule],
   controllers: [AccountController],
   providers: [AccountService],
})
export class AccountModule {}
