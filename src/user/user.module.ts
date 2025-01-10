import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DataModule } from "@data/data.module";
import { AccountController } from "@account/account.controller";
import { AccountService } from "@account/account.service";
import { GoogleStrategy } from "@account/google.strategies";
import { NaverStrategy } from "@account/naver.strategies";
import { MyPageController } from "@mypage/my-page.controller";
import { MyPageService } from "@mypage/my-page.service";
import { MainModule } from "@main/main.module";
import { KakaoStrategy } from "@account/kakako.strategies";
import { ReviewService } from "@mypage/my-page-review.service";

@Module({
   imports: [DataModule, JwtModule, MainModule],
   controllers: [AccountController, MyPageController],
   providers: [AccountService, GoogleStrategy, NaverStrategy, MyPageService, KakaoStrategy, ReviewService],
   exports: [MyPageService],
})
export class UserModule {}
