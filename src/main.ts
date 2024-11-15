import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { httpExceptionFilter } from "./filter/http-exception.filter";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   app.setGlobalPrefix("/api"); // 모든 경로에 /api 붙임
   app.useGlobalFilters(new httpExceptionFilter()); // 예외처리 필터 -> 전역 필터로 설정

   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true, // 불필요한 속성 제거
         forbidNonWhitelisted: true, // 정의되지 않은 속성 거부
         transform: true, // 요청 데이터를 DTO로 변환
      }),
   );

   await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
