import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DataModule } from "src/data/data.module";
import { AccountController } from "./account/account.controller";
import { AccountService } from "./account/account.service";
import { GoogleStrategy } from "./account/google.strategies";
import { NaverStrategy } from "./account/naver.strategies";
import { MyPageController } from "./my-page/my-page.controller";
import { MyPageService } from "./my-page/my-page.service";
import { MainModule } from "src/main/main.module";
import { KakaoStrategy } from "./account/kakako.strategies";

@Module({
   imports: [DataModule, JwtModule, MainModule],
   controllers: [AccountController, MyPageController],
   providers: [AccountService, GoogleStrategy, NaverStrategy, MyPageService, KakaoStrategy],
   exports: [MyPageService],
})
export class UserModule {}
