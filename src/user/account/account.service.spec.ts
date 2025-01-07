import { AccountService } from "./account.service";
import { createUserDto } from "../dto/user.dto";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";

describe("AccountService", () => {
   let service: AccountService;

   let signUpUserInfo: createUserDto;

   beforeAll(async () => {
      const module = await Test.createTestingModule({
         imports: [AppModule],
      }).compile();

      service = module.get<AccountService>(AccountService);
   });

   signUpUserInfo = {
      email: "test12345@test.com",
      name: "테스트",
      password: "test1234!",
      confirmPassword: "test1234!",
      continent: "아시아",
      country: "대한민국",
      city: "서울",
   };

   describe("회원가입 테스트", () => {
      it("회원가입하려는 유저의 정보가 조건에 부합하는지 확인하는 함수", async () => {
         const id = await service.validData(signUpUserInfo);

         expect(id).toBe(45);
         expect(id).not.toBe(undefined);
      });
   });
});
