import { Body, Controller, Get, Post } from "@nestjs/common";
import { MainService } from "./main.service";
import { mainUserDto } from "src/account/dto/user.dto";

@Controller("main")
export class MainController {
   constructor(private mainService: MainService) {}

   @Get("promotion")
   async getPromotion() {
      return await this.mainService.getPromotion();
   }

   @Post("region")
   async getDestinationInUserRegion(@Body() data: mainUserDto) {
      return await this.mainService.getDestinationInUserRegion(data.email);
   }
}
