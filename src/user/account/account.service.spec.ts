import { AccountService } from "@account/account.service";
import { createUserDto } from "@user/dto/user.dto";
import { Test } from "@nestjs/testing";
import { MysqlService } from "@data/mysql/mysql.service";
import { RowDataPacket } from "mysql2";
import { BadRequestException } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

describe("AccountService", () => {
   let service: AccountService;
   let mysqlService: MysqlService;

   const signUpUserInfo: createUserDto = {
      email: "test12345@test.com",
      name: "테스트",
      password: "test1234!",
      confirmPassword: "test1234!",
   };

   beforeAll(async () => {
      const module = await Test.createTestingModule({
         imports: [JwtModule],
         providers: [
            AccountService,
            {
               provide: MysqlService,
               useValue: {
                  isDuplicateEmail: jest.fn().mockResolvedValue({ count: 0 }),
               },
            },
         ],
      }).compile();

      service = module.get<AccountService>(AccountService);
      mysqlService = module.get<MysqlService>(MysqlService);
   });

   describe("validData Function Unit Test", () => {
      it("회원가입하려는 회원의 이메일이 중복되는 경우 400 에러", async () => {
         jest.spyOn(mysqlService, "isDuplicateEmail").mockResolvedValue([{ count: 1 } as RowDataPacket]);
         await expect(service.validData({ ...signUpUserInfo, email: "test@test.com" })).rejects.toThrow(
            BadRequestException,
         );
      });

      it("비밀번호와 비밀번호 확인이 일치하지 않는 경우 400 에러", async () => {
         jest.spyOn(mysqlService, "isDuplicateEmail").mockResolvedValue([{ count: 0 } as RowDataPacket]);
         await expect(service.validData({ ...signUpUserInfo, confirmPassword: "test123!" })).rejects.toThrow(
            BadRequestException,
         );
      });

      it("회원가입 유효성 검증 완료 -> true 반환", async () => {
         jest.spyOn(mysqlService, "isDuplicateEmail").mockResolvedValue([{ count: 0 } as RowDataPacket]);
         const result = await service.validData(signUpUserInfo);
         expect(result).toBeTruthy();
      });
   });
});
