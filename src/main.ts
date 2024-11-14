import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { httpExceptionFilter } from "./filter/http-exception.filter";

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   app.setGlobalPrefix("/api"); // 모든 경로에 /api 붙이기 위함
   app.useGlobalFilters(new httpExceptionFilter()); // 예외처리 필터 -> 전역 필터로 설정

   await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
