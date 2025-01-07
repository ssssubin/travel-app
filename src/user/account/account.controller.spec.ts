import { JwtService } from "@nestjs/jwt";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { MysqlService } from "src/data/mysql/mysql.service";
import { continentDto, countryDto, createUserDto } from "../dto/user.dto";
import { AppModule } from "src/app.module";
import { Test } from "@nestjs/testing";
import { v4 } from "uuid";

describe("Account Controller", () => {
   let controller: AccountController;
   let service: AccountService;

   let jwtService: JwtService;
   let mysqlService: MysqlService;

   let signUpUserInfo: createUserDto;
   let continent: continentDto;
   let country: countryDto;

   beforeAll(async () => {
      const module = await Test.createTestingModule({
         imports: [AppModule],
      }).compile();

      controller = module.get<AccountController>(AccountController);
      service = module.get<AccountService>(AccountService);
      jwtService = module.get<JwtService>(JwtService);
      mysqlService = module.get<MysqlService>(MysqlService);
   });

   signUpUserInfo = {
      email: `${v4()}@test.com`,
      name: "테스트",
      password: "test1234!",
      confirmPassword: "test1234!",
      continent: "아시아",
      country: "대한민국",
      city: "서울",
   };

   it("should be defined", () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
      expect(jwtService).toBeDefined();
      expect(mysqlService).toBeDefined();
   });

   describe("회원가입 테스트", () => {
      it("회원가입 과정에서 모든 대륙을 조회할 수 있어야 함", async () => {
         const { data } = await controller.getContinent();

         expect(data).toStrictEqual(["아시아", "유럽", "북아메리카", "남아메리카", "아프리카", "오세아니아", "남극"]);
      });

      it("선택한 대륙에 속해있는 국가들을 조회할 수 있어야 함", async () => {
         continent = { continent: "아시아" };
         const { data } = await controller.getCountries(continent);

         expect(data).toStrictEqual(["대한민국", "일본", "중국"]);
      });

      it("선택한 국가에 속해있는 도시들을 조회할 수 있어야 함", async () => {
         country = { country: "대한민국" };
         const { data } = await controller.getCities(country);

         expect(data).toStrictEqual(["서울", "인천", "광주"]);
         expect(data).not.toBe(undefined);
      });

      it("회원가입 조건을 모두 만족한다면 해당 유저 정보를 데이터베이스에 저장해야 함", async () => {
         const { data } = await controller.signUp(signUpUserInfo);

         expect(data).toBe("회원가입 되었습니다. 로그인 해주세요 :)");
         expect(data).not.toBe(null);
      });
   });
});
