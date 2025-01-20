import {
   Body,
   Controller,
   Delete,
   Get,
   HttpCode,
   Param,
   Post,
   Put,
   Res,
   UploadedFiles,
   UseInterceptors,
} from "@nestjs/common";
import { MyPageService } from "@mypage/services/my-page.service";
import { Response } from "express";
import { updateUserDto } from "@user/dto/update-user.dto";
import { createReviewDto } from "@mypage/dto/create-review.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ReviewService } from "@mypage/services/my-page-review.service";

@Controller("my-page")
export class MyPageController {
   constructor(
      private mypageService: MyPageService,
      private reviewService: ReviewService,
   ) {}

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

   @Delete("withdrawal")
   async withdrawalUser(@Res({ passthrough: true }) res: Response) {
      return await this.mypageService.withdrawalUser(res);
   }

   @Post("review")
   @UseInterceptors(FilesInterceptor("image"))
   async createReview(
      @Res({ passthrough: true }) res: Response,
      @UploadedFiles() images: Express.Multer.File[],
      @Body() data: createReviewDto,
   ) {
      return await this.reviewService.createReview(res, data, images);
   }

   @Put("review/:id")
   @UseInterceptors(FilesInterceptor("image"))
   async updateReview(
      @Res({ passthrough: true }) res: Response,
      @UploadedFiles() images: Express.Multer.File[],
      @Param("id") id: string,
      @Body() data: createReviewDto,
   ) {
      return await this.reviewService.updateReview(res, images, id, data);
   }

   @HttpCode(204)
   @Delete("review/:id")
   async removeReview(@Res({ passthrough: true }) res: Response, @Param("id") id: string) {
      return await this.reviewService.removeReview(res, id);
   }
}
