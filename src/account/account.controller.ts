import { Body, Controller, Post, Res } from "@nestjs/common";
import { AccountService } from "./account.service";
import { createUserDto, signInUserDto } from "./dto/user.dto";
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
}
