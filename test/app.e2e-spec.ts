import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@src/app.module";
import { createUserDto, signInUserDto } from "@user/dto/user.dto";
import { ConfigModule } from "@nestjs/config";
import { v4 } from "uuid";

describe("AppController (e2e)", () => {
   let app: INestApplication;

   const signUpUser: createUserDto = {
      email: `${v4()}@test.com`,
      name: "신짱구",
      password: "test1234!",
      confirmPassword: "test1234!",
      continent: "아시아",
      country: "대한민국",
      city: "서울",
   };

   const signInUser: signInUserDto = {
      email: "test@test.com",
      password: "test1234!",
   };

   // 테스트 진행하기 전 가장 먼저 실행되는 함수
   beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
         imports: [
            ConfigModule.forRoot({
               // test용 db와 연결
               envFilePath: ".test.env",
               isGlobal: true,
            }),
            AppModule,
         ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
   });

   describe("회원가입/로그인 API", () => {
      it("/sign-up (POST)", async () => {
         const res = await request(app.getHttpServer()).post("/sign-up").send(signUpUser);
         expect(res.status).toBe(201);
         expect(res.body.data).toStrictEqual("회원가입 되었습니다. 로그인 해주세요 :)");
      });

      it("/sign-up/continent (GET)", async () => {
         const res = await request(app.getHttpServer()).get("/sign-up/continent");

         expect(res.status).toBe(200);
         expect(res.body.data).toStrictEqual([
            "아시아",
            "유럽",
            "북아메리카",
            "남아메리카",
            "아프리카",
            "오세아니아",
            "남극",
         ]);
      });

      it("/sign-up/country (POST)", async () => {
         const res = await request(app.getHttpServer()).post("/sign-up/country").send({ continent: "아시아" });

         expect(res.status).toBe(200);
         expect(res.body.data).toStrictEqual(["대한민국", "일본", "중국"]);
      });

      it("/sign-up/city (POST)", async () => {
         const res = await request(app.getHttpServer()).post("/sign-up/city").send({ country: "대한민국" });

         expect(res.status).toBe(200);
         expect(res.body.data).toStrictEqual(["서울", "인천", "광주"]);
      });

      it("/sign-in (POST)", async () => {
         const res = await request(app.getHttpServer()).post("/sign-in").send(signInUser);

         expect(res.status).toBe(200);
         expect(res.body.data).toStrictEqual("로그인에 성공하셨습니다. 환영합니다 :)");
      });
   });
});
