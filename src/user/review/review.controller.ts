import { Body, Controller, Post, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { Response } from "express";
import { createReviewDto } from "../my-page/dto/create-review.dto";
import { ReviewService } from "./review.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

@Controller("review")
export class ReviewController {
   constructor(private reviewSerivce: ReviewService) {}
   @Post()
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
      return await this.reviewSerivce.createReview(res, data, images);
   }
}
