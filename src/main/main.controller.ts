import { Controller, Get, Res } from "@nestjs/common";
import { MainService } from "@main/main.service";
import { Response } from "express";

@Controller("main")
export class MainController {
   constructor(private mainService: MainService) {}

   @Get("promotion")
   async getPromotion() {
      const data = await this.mainService.getPromotion();
      return { err: null, data };
   }

   @Get("region")
   async getDestinationInUserRegion(@Res({ passthrough: true }) res: Response) {
      const { region, payload } = await this.mainService.getDestinationInUserRegion(res);
      return { err: null, data: { region, payload } };
   }

   @Get("reservation")
   async getReservationInUserId(@Res({ passthrough: true }) res: Response) {
      const payload = await this.mainService.getReservation(res);
      return { err: null, data: payload };
   }
}
