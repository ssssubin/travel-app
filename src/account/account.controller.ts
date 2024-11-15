import { Body, Controller, Post } from "@nestjs/common";
import { AccountService } from "./account.service";
import { createUserDto } from "./dto/create-user.dto";

@Controller()
export class AccountController {
   constructor(private accountService: AccountService) {}

   @Post("sign-up")
   async signUp(@Body() userData: createUserDto) {
      return await this.accountService.createUser(userData);
   }
}
