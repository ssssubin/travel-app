import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { AccountService } from "./account.service";
import { continentDto, countryDto, createUserDto, signInUserDto } from "./dto/user.dto";
import { Response } from "express";

@Controller()
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
   async getCountries(@Body() data: continentDto) {
      return await this.accountService.getCountries(data.continent);
   }

   @Post("sign-up/city")
   async getCities(@Body() data: countryDto) {
      return await this.accountService.getCities(data.country);
   }
}
