import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { DataModule } from "src/data/data.module";
import { JwtModule } from "@nestjs/jwt";
import { GoogleStrategy } from "./google.strategies";
import { NaverStrategy } from "./naver.strategies";

@Module({
   imports: [DataModule, JwtModule],
   controllers: [AccountController],
   providers: [AccountService, GoogleStrategy, NaverStrategy],
})
export class AccountModule {}
