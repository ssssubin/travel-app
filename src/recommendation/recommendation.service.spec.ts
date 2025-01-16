import { MysqlService } from "@data/mysql/mysql.service";
import { RecommendationService } from "@recomm/recommendation.service";
import { Test, TestingModule } from "@nestjs/testing";
import { MainService } from "@main/main.service";
import { RowDataPacket } from "mysql2";
import { MyPageService } from "@mypage/my-page.service";

describe("RecommendationService", () => {
   let service: RecommendationService;
   let mysqlService: MysqlService;

   beforeEach(async () => {
      const app: TestingModule = await Test.createTestingModule({
         providers: [
            RecommendationService,
            MainService,
            MyPageService,
            {
               provide: MysqlService,
               useValue: {
                  findDestinationByGps: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
                  findKeywordIdByDestinationId: jest.fn().mockResolvedValue([{ keyword_id: 1 }, { keyword_id: 2 }]),
                  findKeywordNameById: jest.fn().mockResolvedValue([{ name: "관광명소" }]),
                  findImageByDestinationId: jest
                     .fn()
                     .mockResolvedValue([
                        { image: "http://localhost:3000/image1" },
                        { image: "http://localhost:3000/image2" },
                     ]),
                  findDestinationById: jest.fn().mockResolvedValue([
                     { name: "경복궁", address: "서울특별시 종로구 사직로 161", city_id: 1 },
                     { name: "남산타워", address: "서울특별시 용산구 남산공원길 105", city_id: 1 },
                  ]),
                  findDestinationInformationById: jest
                     .fn()
                     .mockResolvedValue([{ star_point_average: 4.5 }, { star_point_average: 3.45 }]),
               },
            },
         ],
      }).compile();

      service = app.get<RecommendationService>(RecommendationService);
      mysqlService = app.get<MysqlService>(MysqlService);
   });

   describe("getDestinationIdByGps", () => {
      it("현재 위치에서 반경 2km 이내의 여행지 id 리스트 반환", async () => {
         jest.spyOn(mysqlService, "findDestinationByGps").mockResolvedValue([{ id: 1 }, { id: 2 }] as RowDataPacket[]);
         const result = await service.getDestinationIdListByGps(35.19041, 126.8248);
         expect(result).toStrictEqual([1, 2]);
      });
   });

   describe("getKeywordId", () => {
      it("여행지별 키워드 id 리스트 반환", async () => {
         jest
            .spyOn(mysqlService, "findKeywordIdByDestinationId")
            .mockResolvedValueOnce([{ keyword_id: 1 }, { keyword_id: 2 }] as RowDataPacket[])
            .mockResolvedValueOnce([{ keyword_id: 2 } as RowDataPacket]);
         const result = await service.getKeywordId([1, 2]);
         expect(result).toStrictEqual([
            [1, [1, 2]],
            [2, [2]],
         ]);
      });
   });

   describe("getKeywordName", () => {
      it("여행지별 키워드 이름 리스트 담는 배열 반환", async () => {
         jest
            .spyOn(mysqlService, "findKeywordNameById")
            .mockResolvedValueOnce([{ name: "모험" }, { name: "관광명소" }] as RowDataPacket[])
            .mockResolvedValueOnce([{ name: "관광명소" } as RowDataPacket]);
         const result = await service.getKeywordName([[1, 2], [2]]);
         expect(result).toStrictEqual([["모험", "관광명소"], ["관광명소"]]);
      });
   });

   describe("getDestinationNameAndAddress", () => {
      it("여행지 id로 여행지명, 주소 리스트 반환", async () => {
         jest
            .spyOn(mysqlService, "findDestinationById")
            .mockResolvedValueOnce([
               { name: "경복궁", address: "서울특별시 종로구 사직로 161", city_id: 1 } as RowDataPacket,
            ])
            .mockResolvedValueOnce([
               { name: "남산타워", address: "서울특별시 용산구 남산공원길 105", city_id: 1 } as RowDataPacket,
            ]);
         const result = await service.getDestinationNameAndAddress([1, 2]);
         expect(result).toStrictEqual([
            { name: "경복궁", address: "서울특별시 종로구 사직로 161" },
            { name: "남산타워", address: "서울특별시 용산구 남산공원길 105" },
         ]);
      });
   });
});
