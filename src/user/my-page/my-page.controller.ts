import { Controller, Get, Req, Res } from "@nestjs/common";
import { MyPageService } from "./my-page.service";
import { Request, Response } from "express";

@Controller("my-page")
export class MyPageController {
   constructor(private mypageService: MyPageService) {}
   @Get()
   async getMyPage(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
      return await this.mypageService.getMyPage(res, req);
   }
}
