import { Test } from "@nestjs/testing";
import { MysqlService } from "@data/mysql/mysql.service";
import { ReviewService } from "@mypage/services/my-page-review.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { MysqlCreateTableService } from "@data/mysql/mysql-create-table.service";
import { RowDataPacket } from "mysql2";

describe("MyPageService", () => {
   let service: ReviewService;
   let mysqlService: MysqlService;

   beforeAll(async () => {
      const module = await Test.createTestingModule({
         providers: [
            ReviewService,
            {
               provide: MysqlService,
               useValue: {
                  findDestinationByName: jest.fn().mockResolvedValue([{ id: 1 }]),
                  findReservationByUserEmail: jest
                     .fn()
                     .mockResolvedValue([{ destination_id: 1, format_date: "01월 10일 17:30", day: "금" }]),
               },
            },
            MysqlCreateTableService,
         ],
      }).compile();

      service = module.get<ReviewService>(ReviewService);
      mysqlService = module.get<MysqlService>(MysqlService);
   });

   describe("validateData Function Unit Test", () => {
      it("여행지명으로 DB 조회했을 때, 여행지가 존재하지 않는 경우 404 에러", async () => {
         jest.spyOn(mysqlService, "findDestinationByName").mockResolvedValue([]);
         await expect(service.validateData("test@test.com", "경복", "01월 11일(토)")).rejects.toThrow(
            NotFoundException,
         );
      });

      it("유저가 방문한 여행지가 아닌 경우 400 에러", async () => {
         jest.spyOn(mysqlService, "findDestinationByName").mockResolvedValue([{ id: 1 } as RowDataPacket]);
         jest.spyOn(mysqlService, "findReservationByUserEmail").mockResolvedValue([]);
         await expect(service.validateData("test@test.com", "경복궁", "01월 11일(토)")).rejects.toThrow(
            BadRequestException,
         );
      });

      it("사용자가 작성한 리뷰 데이터 유효성 검증 완료 -> 여행지 id 반환", async () => {
         jest.spyOn(mysqlService, "findDestinationByName").mockResolvedValue([{ id: 1 } as RowDataPacket]);
         jest
            .spyOn(mysqlService, "findReservationByUserEmail")
            .mockResolvedValue([{ destination_id: 1, format_date: "01월 10일 17:30", day: "금" } as RowDataPacket]);
         const result = await service.validateData("test@test.com", "경복궁", "01월 10일(금)");
         expect(result).toBe(1);
      });
   });
});
