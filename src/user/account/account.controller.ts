import { Body, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { AccountService } from "./account.service";
import { continentDto, countryDto, createUserDto, signInUserDto } from "../dto/user.dto";
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

   @Post("sign-in")
   async signIn(@Res({ passthrough: true }) res: Response, @Body() userData: signInUserDto) {
      return await this.accountService.signInUser(res, userData);
   }

   @Get("sign-up/continent")
   async getContinent() {
      return await this.accountService.getContinent();
   }

   @Post("sign-up/country")
   async getCountries(@Res({ passthrough: true }) res: Response, @Body() data: continentDto) {
      return await this.accountService.getCountries(res, data.continent);
   }

   @Post("sign-up/city")
   async getCities(@Res({ passthrough: true }) res: Response, @Body() data: countryDto) {
      return await this.accountService.getCities(res, data.country);
   }

   @Post("sign-out")
   async signOut(@Res({ passthrough: true }) res: Response) {
      return await this.accountService.signOut(res);
   }

   @Get("auth/sign-in/google")
   @UseGuards(AuthGuard("google"))
   async googleSignIn() {}

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
}
