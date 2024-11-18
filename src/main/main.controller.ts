import { Controller, Get } from "@nestjs/common";
import { MainService } from "./main.service";

@Controller("main")
export class MainController {
   constructor(private mainService: MainService) {}

   @Get("promotion")
   async getPromotion() {
      return await this.mainService.getPromotion();
   }
}
