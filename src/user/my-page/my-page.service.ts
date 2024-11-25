import { Injectable, NotFoundException } from "@nestjs/common";
import { Request, Response } from "express";
import { MysqlService } from "src/data/mysql/mysql.service";
import { MainService } from "src/main/main.service";

@Injectable()
export class MyPageService {
   constructor(
      private mysqlService: MysqlService,
      private mainService: MainService,
   ) {}
   async getMyPage(res: Response, req: Request) {
      try {
         // 유저가 예약한 여행지 리스트
         const foundReservation = await this.mainService.getReservation(res);
         const { email } = res.locals.user;
         const foundUser = await this.mysqlService.findUserByEmail(email);

         // 유저 이메일, 이름 정보
         const user = { email, name: foundUser[0].name };

         // 유저가 방문한 여행지 리스트
         const foundVisitedDestination = await this.mysqlService.findVisitedDestinationByUserEmail(email);
         const destinationIdList = Array.isArray(foundVisitedDestination)
            ? foundVisitedDestination.map((destination) => destination.destination_id)
            : [];
      } catch (e) {
         throw e;
      }
   }
}
