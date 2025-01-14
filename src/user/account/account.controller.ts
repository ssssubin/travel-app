import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { AccountService } from "@account/account.service";
import { createUserDto, signInUserDto } from "@user/dto/user.dto";
import { Request, Response } from "express";
import { AuthGuard } from "@nestjs/passport";

@Controller()
@UseInterceptors()
export class AccountController {
   constructor(private accountService: AccountService) {}

   @Post("sign-up")
   async signUp(@Body() userData: createUserDto) {
      return await this.accountService.createUser(userData);
   }

   @HttpCode(200)
   @Post("sign-in")
   async signIn(@Res({ passthrough: true }) res: Response, @Body() userData: signInUserDto) {
      return await this.accountService.signInUser(res, userData);
   }

   @Post("sign-out")
   async signOut(@Res({ passthrough: true }) res: Response) {
      return await this.accountService.signOut(res);
   }

   @Get("auth/sign-in/google")
   @UseGuards(AuthGuard("google"))
   googleSignIn() {}

   @Get("auth/sign-in/google/callback")
   @UseGuards(AuthGuard("google"))
   googleSignInCallback(@Res({ passthrough: true }) res: Response, @Req() req) {
      return this.accountService.googleSignIn(res, req);
   }

   @Get("auth/sign-in/naver")
   @UseGuards(AuthGuard("naver"))
   naverSignIn() {}

   @Get("auth/sign-in/naver/callback")
   @UseGuards(AuthGuard("naver"))
   naverSignInCallback(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
      return this.accountService.naverSignIn(res, req);
   }

   @Get("auth/sign-in/kakao")
   @UseGuards(AuthGuard("kakako"))
   kakakoSignIn() {}

   @Get("auth/sign-in/kakao/callback")
   @UseGuards(AuthGuard("kakako"))
   kakakoSignInCallback(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
      return this.accountService.kakaoSignIn(res, req);
   }
}
