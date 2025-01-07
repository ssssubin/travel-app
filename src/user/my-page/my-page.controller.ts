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
import { MyPageService } from "./my-page.service";
import { Response } from "express";
import { updateUserDto } from "../dto/update-user.dto";
import { createReviewDto } from "./dto/create-review.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { ReviewService } from "./my-page-review.service";

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
   @UseInterceptors(
      FilesInterceptor("images", null, {
         storage: diskStorage({
            destination: "./uploads/temp", // 임시로 저장할 디렉토리
            filename: (req, file, callback) => {
               const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
               const ext = extname(file.originalname);
               callback(null, `image-${uniqueSuffix}${ext}`);
            },
         }),
         fileFilter: (req, file, callback) => {
            if (!file) {
               // null 허용하기 위해 필터 통과
               return callback(null, true);
            }
            const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
            if (allowedMimeTypes.includes(file.mimetype)) {
               callback(null, true);
            } else {
               callback(new Error("잘못된 파일입니다."), false);
            }
         },
      }),
   )
   async createReview(
      @Res({ passthrough: true }) res: Response,
      @UploadedFiles() images: Express.Multer.File | null,
      @Body() data: createReviewDto,
   ) {
      return await this.reviewService.createReview(res, data, images);
   }

   @Put("review/:id")
   @UseInterceptors(
      FilesInterceptor("images", null, {
         storage: diskStorage({
            destination: "./uploads/temp", // 임시로 저장할 디렉토리
            filename: (req, file, callback) => {
               const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
               const ext = extname(file.originalname);
               callback(null, `image-${uniqueSuffix}${ext}`);
            },
         }),
         fileFilter: (req, file, callback) => {
            if (!file) {
               // null 허용하기 위해 필터 통과
               return callback(null, true);
            }
            const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
            if (allowedMimeTypes.includes(file.mimetype)) {
               callback(null, true);
            } else {
               callback(new Error("잘못된 파일입니다."), false);
            }
         },
      }),
   )
   async updateReview(
      @Res({ passthrough: true }) res: Response,
      @UploadedFiles() images: Express.Multer.File | null,
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
