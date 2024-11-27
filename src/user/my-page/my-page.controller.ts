import { Controller, Get, Res } from "@nestjs/common";
import { MyPageService } from "./my-page.service";
import { Response } from "express";

@Controller("my-page")
export class MyPageController {
   constructor(private mypageService: MyPageService) {}

   @Get()
   async getMyPage(@Res({ passthrough: true }) res: Response) {
      return await this.mypageService.getMyPage(res);
   }

   @Get("profile")
   async getProfile(@Res({ passthrough: true }) res: Response) {
      return await this.mypageService.getProfile(res);
   }
}
