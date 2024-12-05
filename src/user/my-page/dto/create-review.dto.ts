import { IsNotEmpty, IsNumberString, IsString, Matches } from "class-validator";

export class createReviewDto {
   @IsNotEmpty({ message: "여행지명을 입력해주세요." })
   @IsString({ message: "여행지명은 문자열입니다." })
   readonly name: string; // 방문한 여행지명

   @IsNotEmpty({ message: "방문 날짜를 입력해주세요." })
   @Matches(/^(0[0-9]|1[0-2])월 (0[1-9]|[12][0-9]|3[01])일\([월화수목금토일]\)$/, {
      message: "방문 날짜는 올바른 형식이어야 합니다. 예: '01월 01일(월)'",
   })
   readonly date: string; // 방문 날짜

   @IsNumberString({}, { message: "평점은 숫자입니다." })
   readonly rating: number; // 방문한 여행지 평점

   @IsNotEmpty({ message: "리뷰를 작성해주세요." })
   @IsString({ message: "리뷰는 문자열입니다." })
   readonly review: string; // 방문한 여행지에 대한 리뷰
}
