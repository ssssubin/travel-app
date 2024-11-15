import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MysqlService } from "src/data/mysql/mysql.service";
import { createUserDto, signInUserDto } from "./dto/user.dto";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AccountService {
   constructor(
      private mysqlService: MysqlService,
      private jwtService: JwtService,
   ) {}

   // 유효성 검증하는 함수
   async validData(userData: createUserDto): Promise<number> {
      const { email, password, confirmPassword, continent, country, city } = userData;

      // 이메일 중복 확인
      const foundEmail = await this.mysqlService.isDuplicateEmail(email);
      if (foundEmail[0].count !== 0) {
         throw new BadRequestException("이미 존재하는 이메일입니다.");
      }

      // 비밀번호 일치 여부 판단
      if (password !== confirmPassword) {
         throw new BadRequestException("비밀번호가 일치하지 않습니다.");
      }

      // 대륙 존재 여부 판단
      const isContinent = await this.mysqlService.isContinent(continent);
      if (isContinent[0].count === 0) {
         throw new NotFoundException("존재하지 않는 대륙입니다.");
      }

      // 국가 존재 여부 판단
      const isCountry = await this.mysqlService.isCountry(country);
      if (isCountry[0].count === 0) {
         throw new NotFoundException("존재하지 않는 국가입니다.");
      }

      // 도시 존재 여부 판단
      const foundCity = await this.mysqlService.findCityIdByName(city);
      if (foundCity[0] === undefined) {
         throw new NotFoundException("존재하지 않는 나라입니다.");
      }

      return foundCity[0].id;
   }

   // 회원가입 API
   async createUser(userData: createUserDto) {
      try {
         const { email, name, password } = userData;

         // 유효성 검증 후 도시 id 받음
         const cityId = await this.validData(userData);

         // 비밀번호 해시화
         const hashPassword = await bcrypt.hash(password, 10);

         // 회원 등록
         await this.mysqlService.registerUser(email, name, hashPassword, cityId);

         return { err: null, data: "회원가입 되었습니다. 로그인 해주세요 :)" };
      } catch (e) {
         throw e;
      }
   }

   // 로그인 API
   async signInUser(res: Response, userData: signInUserDto) {
      try {
         const { email, password } = userData;
         // 이메일 존재 여부 확인
         const foundUser = await this.mysqlService.findUserByEmail(email);
         if (foundUser[0] === undefined) {
            throw new BadRequestException("이메일이나 비밀번호가 일치하지 않습니다.");
         }

         // 비밀번호 확인
         const isPassword = await bcrypt.compare(password, foundUser[0].password);
         if (isPassword === false) {
            throw new BadRequestException("이메일이나 비밀번호가 일치하지 않습니다.");
         }

         // jwt 토큰 생성
         const token = await this.jwtService.signAsync({ email }, { secret: process.env.USER_SECRET_KEY });
         res.status(200).cookie("_uu", token, { httpOnly: true, secure: true });

         return { err: null, data: "로그인에 성공하셨습니다. 환영합니다 :)" };
      } catch (e) {
         throw e;
      }
   }
}
