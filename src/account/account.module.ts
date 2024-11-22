import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { DataModule } from "src/data/data.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { GoogleStrategy } from "./google.strategies";

@Module({
   imports: [DataModule, JwtModule, PassportModule.register({ defaultStrategy: "google" })],
   controllers: [AccountController],
   providers: [AccountService, GoogleStrategy],
})
export class AccountModule {}
