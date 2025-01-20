import { MysqlService } from "@data/mysql/mysql.service";
import { MyPageService } from "@mypage/services/my-page.service";
import { Test } from "@nestjs/testing";
import { MainService } from "@main/main.service";
import { RowDataPacket } from "mysql2";
import { updateUserDto } from "@srcuser/dto/update-user.dto";
import { BadRequestException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

describe("MyPageService", () => {
   let service: MyPageService;
   let mysqlService: MysqlService;
   const res = { locals: { user: { email: "test@test.com" } } };

   beforeAll(async () => {
      const module = await Test.createTestingModule({
         providers: [
            MyPageService,
            MainService,
            {
               provide: MysqlService,
               useValue: {
                  findKeywordIdByUserEmail: jest.fn(),
                  findKeywordNameById: jest.fn(),
                  findUserByEmail: jest.fn(),
                  updateUser: jest.fn(),
               },
            },
         ],
      }).compile();

      service = module.get<MyPageService>(MyPageService);
      mysqlService = module.get<MysqlService>(MysqlService);
   });

   describe("keywordList Function Unit Test", () => {
      it("유저가 선택한 5개의 키워드 중 일부만 선택했을 경우, 일부는 null로 반환", async () => {
         jest
            .spyOn(mysqlService, "findKeywordIdByUserEmail")
            .mockResolvedValue([
               { keyword_id: 1 },
               { keyword_id: 2 },
               { keyword_id: null },
               { keyword_id: null },
               { keyword_id: null },
            ] as RowDataPacket[]);
         jest.spyOn(mysqlService, "findKeywordNameById").mockImplementation(async (keywordId) => {
            if (keywordId === 1) return [{ name: "모험" }] as RowDataPacket[];
            if (keywordId === 2) return [{ name: "관광명소" }] as RowDataPacket[];
            if (keywordId === null) return [{ name: null }] as RowDataPacket[];
            return [] as RowDataPacket[];
         });
         const result = await service.keywordList("test@test.com");

         expect(result).toStrictEqual(["모험", "관광명소", null, null, null]);
      });

      it("유저가 선택한 키워드가 있는 경우 키워드 배열 반환", async () => {
         jest
            .spyOn(mysqlService, "findKeywordIdByUserEmail")
            .mockResolvedValue([
               { keyword_id: 1 },
               { keyword_id: 2 },
               { keyword_id: 3 },
               { keyword_id: 4 },
               { keyword_id: 5 },
            ] as RowDataPacket[]);
         jest.spyOn(mysqlService, "findKeywordNameById").mockImplementation(async (keywordId) => {
            if (keywordId === 1) return [{ name: "모험" }] as RowDataPacket[];
            if (keywordId === 2) return [{ name: "관광명소" }] as RowDataPacket[];
            if (keywordId === 3) return [{ name: "액티비티" }] as RowDataPacket[];
            if (keywordId === 4) return [{ name: "힐링" }] as RowDataPacket[];
            if (keywordId === 5) return [{ name: "야경명소" }] as RowDataPacket[];
            return [] as RowDataPacket[];
         });

         const result = await service.keywordList("test@test.com");

         expect(result).toStrictEqual(["모험", "관광명소", "액티비티", "힐링", "야경명소"]);
      });
   });

   describe("getProfile Function Unit Test", () => {
      const userInfo = {
         email: "test@test.com",
         name: "신짱구",
         image: "http://localhost:3000/profile1.png",
         password: "1234",
         is_user: 1,
      };

      it("유저 프로필 조회 성공", async () => {
         jest.spyOn(mysqlService, "findUserByEmail").mockResolvedValue([userInfo as RowDataPacket]);
         const result = await service.getProfile(res as any);

         expect(result).toStrictEqual({
            err: null,
            data: {
               user: {
                  email: userInfo.email,
                  name: userInfo.name,
                  image: userInfo.image,
               },
               keyword: ["모험", "관광명소", "액티비티", "힐링", "야경명소"],
            },
         });
      });
   });

   describe("updateProfile Function Unit Test", () => {
      const updateData: updateUserDto = {
         email: "test@test.com",
         name: "신짱아",
         image: "profile.jpg",
         password: "sadlfjk422314@",
      };

      it("이메일을 수정하려고 하는 경우 400 에러", async () => {
         await expect(service.updateProfile(res as any, { ...updateData, email: "test1@test.com" })).rejects.toThrow(
            BadRequestException,
         );
      });

      it("비밀번호가 불일치할 경우 400에러", async () => {
         jest
            .spyOn(mysqlService, "findUserByEmail")
            .mockResolvedValue([{ ...updateData, name: "신짱구", image: null, is_user: 1 } as RowDataPacket]);
         jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);
         await expect(service.updateProfile(res as any, { ...updateData, password: "asldkfjk1231$" })).rejects.toThrow(
            BadRequestException,
         );
      });

      it("유저 정보 업데이트", async () => {
         jest
            .spyOn(mysqlService, "findUserByEmail")
            .mockResolvedValue([{ ...updateData, name: "신짱구", image: null, is_user: 1 } as RowDataPacket]);
         jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
         jest.spyOn(mysqlService, "updateUser").mockResolvedValue([{ affectedRows: 1 } as RowDataPacket]);
         const result = await service.updateProfile(res as any, updateData);
         expect(result).toStrictEqual({
            err: null,
            data: "회원 정보가 수정되었습니다.",
         });
      });
   });
});
