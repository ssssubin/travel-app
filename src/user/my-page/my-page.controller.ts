import { Body, Controller, Get, Put, Res } from "@nestjs/common";
import { MyPageService } from "./my-page.service";
import { Response } from "express";
import { updateUserDto } from "../dto/update-user.dto";

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

   @Put("profile")
   async updateProfile(@Res({ passthrough: true }) res: Response, @Body() updateData: updateUserDto) {
      return await this.mypageService.updateProfile(res, updateData);
   }

   @Get("keyword")
   async getKeyword() {
      return await this.mypageService.getKeyword();
   }

   @Put("keyword")
   async updateKeyword(@Res({ passthrough: true }) res: Response, @Body() data: { keyword: string[] }) {
      return await this.mypageService.updateKeyword(res, data.keyword.slice(0, 5));
   }
}
