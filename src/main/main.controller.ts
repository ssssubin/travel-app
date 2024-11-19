import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { MainService } from "./main.service";
import { mainUserDto } from "src/account/dto/user.dto";
import { Response } from "express";

@Controller("main")
export class MainController {
   constructor(private mainService: MainService) {}

   @Get("promotion")
   async getPromotion() {
      return await this.mainService.getPromotion();
   }

   @Post("region")
   async getDestinationInUserRegion(@Res({ passthrough: true }) res: Response, @Body() data: mainUserDto) {
      return await this.mainService.getDestinationInUserRegion(res, data.email);
   }

   @Post("reservation")
   async getReservationInUserId(@Res({ passthrough: true }) res: Response, @Body() data: mainUserDto) {
      return await this.mainService.getReservation(res, data.email);
   }
}
