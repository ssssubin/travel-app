import { MysqlService } from "@data/mysql/mysql.service";
import { RecommendationService } from "@recomm/recommendation.service";
import { Test, TestingModule } from "@nestjs/testing";
import { MainService } from "@main/main.service";
import { RowDataPacket } from "mysql2";
import { MysqlCreateTableService } from "@data/mysql/mysql-create-table.service";

describe("RecommendationService", () => {
   let service: RecommendationService;
   let mysqlService: MysqlService;

   beforeEach(async () => {
      const app: TestingModule = await Test.createTestingModule({
         providers: [
            RecommendationService,
            MainService,
            MysqlCreateTableService,
            {
               provide: MysqlService,
               useValue: {
                  findDestinationByGps: jest.fn(),
                  findKeywordIdByDestinationId: jest.fn(),
                  findKeywordNameById: jest.fn(),
                  findImageByDestinationId: jest.fn(),
                  findDestinationById: jest.fn(),
                  findDestinationInformationById: jest.fn(),
                  findKeywordIdByName: jest.fn(),
                  findDestinationByKeywordId: jest.fn(),
                  findRegionByCityId: jest.fn(),
                  findCityIdByName: jest.fn(),
                  findDestinationByCityId: jest.fn(),
               },
            },
         ],
      }).compile();

      service = app.get<RecommendationService>(RecommendationService);
      mysqlService = app.get<MysqlService>(MysqlService);
   });

   const destination: { id: number; name: string; address: string; city_id: number }[] = [
      { id: 1, name: "경복궁", address: "서울특별시 종로구 사직로 161", city_id: 1 },
      { id: 2, name: "남산타워", address: "서울특별시 용산구 남산공원길 105", city_id: 1 },
   ];

   describe("destinationKeyword Function Unit Test", () => {
      it("여행지별 키워드 리스트 반환", async () => {
         jest.spyOn(mysqlService, "findKeywordIdByName").mockImplementation(async (name) => {
            if (name === "모험") return [{ id: 1 }] as RowDataPacket[];
            if (name === "관광명소") return [{ id: 2 }] as RowDataPacket[];
         });

         jest.spyOn(mysqlService, "findDestinationByKeywordId").mockImplementation(async (id) => {
            if (id === 1) return [{ destination_id: 1 }] as RowDataPacket[];
            if (id === 2) return [{ destination_id: 1 }, { destination_id: 2 }] as RowDataPacket[];
            return [] as RowDataPacket[];
         });

         const result = await service.destinationKeyword(["모험", "관광명소"]);
         expect(result).toStrictEqual([
            [1, ["모험", "관광명소"]],
            [2, ["관광명소"]],
         ]);
      });
   });

   describe("destinationList Function Unit Test", () => {
      it("여행지별 이름, 주소, 도시, 아이디를 반환", async () => {
         jest.spyOn(mysqlService, "findDestinationById").mockImplementation(async (id) => {
            if (id === 1)
               return [
                  { name: destination[0].name, address: destination[0].address, city_id: destination[0].city_id },
               ] as RowDataPacket[];
            if (id === 2)
               return [
                  { name: destination[1].name, address: destination[1].address, city_id: destination[1].city_id },
               ] as RowDataPacket[];
         });
         const result = await service.destinationList([
            [1, ["모험", "관광명소"]],
            [2, ["관광명소"]],
         ]);
         expect(result).toStrictEqual([
            { address: destination[0].address, cityId: destination[0].city_id, name: destination[0].name },
            { address: destination[1].address, cityId: destination[1].city_id, name: destination[1].name },
         ]);
      });
   });

   describe("regionList Function Unit Test", () => {
      it("여행지별 지역 반환", async () => {
         jest
            .spyOn(mysqlService, "findRegionByCityId")
            .mockResolvedValue([{ country: "대한민국", city: "서울" }] as RowDataPacket[]);
         const result = await service.regionList([1, 1]);
         expect(result).toStrictEqual(["대한민국, 서울", "대한민국, 서울"]);
      });
   });

   describe("keywordImageList Function Unit Test", () => {
      it("여행지별 이미지 리스트 반환(키워드 기반 API)", async () => {
         jest.spyOn(mysqlService, "findImageByDestinationId").mockImplementation(async (image) => {
            if (image === 1)
               return [
                  {
                     image: "http://localhost:3000/file1.jpg",
                  },
                  { image: "http://localhost:3000/file11.png" },
               ] as RowDataPacket[];
            if (image === 2) return [{ image: "http://localhost:3000/file2.jpg" }] as RowDataPacket[];
            if (image === 3) return [{ image: "http://localhost:3000/file3.jpeg" }] as RowDataPacket[];
            return [] as RowDataPacket[];
         });
         const result = await service.keywordImageList([
            [1, ["모험", "관광명소"]],
            [2, ["관광명소"]],
         ]);
         expect(result).toStrictEqual([
            [
               {
                  image: "http://localhost:3000/file1.jpg",
               },
               { image: "http://localhost:3000/file11.png" },
            ],
            [{ image: "http://localhost:3000/file2.jpg" }],
         ]);
      });
   });

   describe("getDestination Function Unit Test", () => {
      it("사용자가 선택한 지역에 속해있는 여행지 리스트 반환", async () => {
         const data = destination.map(({ city_id, ...rest }) => rest);
         jest.spyOn(mysqlService, "findCityIdByName").mockResolvedValue([{ id: 1 }] as RowDataPacket[]);
         jest.spyOn(mysqlService, "findDestinationByCityId").mockResolvedValue([data[0], data[1]] as RowDataPacket[]);
         const result = await service.getDestination("서울", 1, 10);
         expect(result).toStrictEqual([data[0], data[1]]);
      });
   });

   describe("getKeywordId Function Unit Test", () => {
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

   describe("getKeywordName Function Unit Test", () => {
      it("여행지별 키워드 이름 리스트 담는 배열 반환", async () => {
         jest.spyOn(mysqlService, "findKeywordNameById").mockImplementation(async (id) => {
            if (id === 1) return [{ name: "모험" }] as RowDataPacket[];
            if (id === 2) return [{ name: "관광명소" }] as RowDataPacket[];
            return [] as RowDataPacket[];
         });

         const result = await service.getKeywordName([[1, 2], [2]]);
         expect(result).toStrictEqual([["모험", "관광명소"], ["관광명소"]]);
      });
   });

   describe("regionImageList Function Unit Test", () => {
      it("여행지별 이미지 리스트 반환", async () => {
         jest.spyOn(mysqlService, "findImageByDestinationId").mockImplementation(async (image) => {
            if (image === 1)
               return [
                  {
                     image: "http://localhost:3000/file1.jpg",
                  },
                  { image: "http://localhost:3000/file11.png" },
               ] as RowDataPacket[];
            if (image === 2) return [{ image: "http://localhost:3000/file2.jpg" }] as RowDataPacket[];
            if (image === 3) return [{ image: "http://localhost:3000/file3.jpeg" }] as RowDataPacket[];
            return [] as RowDataPacket[];
         });
         const result = await service.regionImageList([1, 2, 3]);
         expect(result).toStrictEqual([
            ["http://localhost:3000/file1.jpg", "http://localhost:3000/file11.png"],
            ["http://localhost:3000/file2.jpg"],
            ["http://localhost:3000/file3.jpeg"],
         ]);
      });
   });

   describe("getDestinationIdByGps Function Unit Test", () => {
      it("현재 위치에서 반경 2km 이내의 여행지 id 리스트 반환", async () => {
         jest.spyOn(mysqlService, "findDestinationByGps").mockResolvedValue([{ id: 1 }, { id: 2 }] as RowDataPacket[]);
         const result = await service.getDestinationIdListByGps(35.19041, 126.8248);
         expect(result).toStrictEqual([1, 2]);
      });
   });

   describe("getDestinationNameAndAddress Function Unit Test", () => {
      it("여행지 id로 여행지명, 주소 리스트 반환", async () => {
         const data = destination.map(({ id, ...rest }) => rest);
         jest
            .spyOn(mysqlService, "findDestinationById")
            .mockResolvedValueOnce([data[0] as RowDataPacket])
            .mockResolvedValueOnce([data[1] as RowDataPacket]);
         const result = await service.getDestinationNameAndAddress([1, 2]);
         expect(result).toStrictEqual([
            { name: data[0].name, address: data[0].address },
            { name: data[1].name, address: data[1].address },
         ]);
      });
   });
});
