import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DataModule } from "@data/data.module";
import { AccountController } from "@account/account.controller";
import { AccountService } from "@account/account.service";
import { GoogleStrategy } from "@account/strategies/google.strategies";
import { NaverStrategy } from "@account/strategies/naver.strategies";
import { MyPageController } from "@mypage/my-page.controller";
import { MyPageService } from "@mypage/services/my-page.service";
import { MainModule } from "@main/main.module";
import { KakaoStrategy } from "@account/strategies/kakako.strategies";
import { ReviewService } from "@mypage/services/my-page-review.service";

@Module({
   imports: [DataModule, JwtModule, MainModule],
   controllers: [AccountController, MyPageController],
   providers: [AccountService, GoogleStrategy, NaverStrategy, MyPageService, KakaoStrategy, ReviewService],
   exports: [MyPageService],
})
export class UserModule {}
