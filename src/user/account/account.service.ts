import { BadRequestException, Injectable } from "@nestjs/common";
import { MysqlService } from "@data/mysql/mysql.service";
import { createUserDto, signInUserDto } from "@user/dto/user.dto";
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
   async validData(userData: createUserDto): Promise<boolean> {
      const { email, password, confirmPassword } = userData;

      // 이메일 중복 확인
      const foundEmail = await this.mysqlService.isDuplicateEmail(email);
      if (foundEmail[0].count !== 0) {
         throw new BadRequestException("이미 존재하는 이메일입니다.");
      }

      // 비밀번호 일치 여부 판단
      if (password !== confirmPassword) {
         throw new BadRequestException("비밀번호가 일치하지 않습니다.");
      }

      return true;
   }

   // 회원가입 API
   async createUser(userData: createUserDto) {
      try {
         const { email, name, password } = userData;

         // 유효성 검증
         await this.validData(userData);

         // 비밀번호 해시화
         const hashPassword = await bcrypt.hash(password, 10);

         // 회원 등록 및 유저 - 키워드 null로 설정
         await Promise.all([
            this.mysqlService.registerUser(email, name, hashPassword),
            this.mysqlService.initializationKeyword(email),
         ]);

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
         res.cookie("_uu", token, { httpOnly: true, secure: true });
         return { err: null, data: "로그인에 성공하셨습니다. 환영합니다 :)" };
      } catch (e) {
         throw e;
      }
   }

   // 로그아웃 API
   async signOut(res: Response) {
      try {
         res.status(200).clearCookie("_uu");
         return { err: null, data: "성공적으로 로그아웃 되었습니다." };
      } catch (e) {
         throw e;
      }
   }

   // 구글 로그인 API
   async googleSignIn(res: Response, req) {
      try {
         // 구글 이메일
         const { email } = req.user;
         // 유저 존재 여부 확인
         const findUser = await this.mysqlService.isDuplicateEmail(email);

         // 구글 로그인으로 로그인하려는 이메일이 db에 존재하지 않는 경우
         // 회원가입 페이지로
         if (findUser[0].count === 0) {
            res.statusCode = 301;
            return {
               err: null,
               data: { email, url: process.env.SIGN_UP_URL },
            };
         }

         // JWT 발급한 후, 쿠키에 담아 보냄
         const token = await this.jwtService.signAsync({ email }, { secret: process.env.USER_SECRET_KEY });
         res.cookie("_uu", token, { httpOnly: true, secure: true });
         return { err: null, data: "로그인에 성공하셨습니다. 환영합니다 :)" };
      } catch (e) {
         throw e;
      }
   }

   // 네이버 로그인 API
   async naverSignIn(res: Response, req) {
      try {
         // 네이버 이메일
         const { email } = req.user;
         // 유저 존재 여부 확인
         const foundEmail = await this.mysqlService.isDuplicateEmail(email);
         // 네이버 로그인으로 로그인하려는 이메일이 db에 존재하지 않는 경우
         // 회원가입 페이지로
         if (foundEmail[0].count === 0) {
            res.statusCode = 301;
            return {
               err: null,
               data: { email, url: process.env.SIGN_UP_URL },
            };
         }

         // JWT 발급한 후, 쿠키에 담아 보냄
         const token = await this.jwtService.signAsync({ email }, { secret: process.env.USER_SECRET_KEY });
         res.cookie("_uu", token, { httpOnly: true, secure: true });
         return { err: null, data: "로그인에 성공하셨습니다. 환영합니다 :)" };
      } catch (e) {
         throw e;
      }
   }

   // 카카오톡 로그인 API
   async kakaoSignIn(res: Response, req) {
      try {
         // 카카오 이메일
         const { email } = req.user;
         // 유저 존재 여부 확인
         const foundEmail = await this.mysqlService.isDuplicateEmail(email);
         // 카카오 로그인으로 로그인하려는 이메일이 db에 존재하지 않는 경우
         // 회원가입 페이지로
         if (foundEmail[0].count === 0) {
            res.statusCode = 301;
            return {
               err: null,
               data: { email, url: process.env.SIGN_UP_URL },
            };
         }

         // JWT 발급한 후, 쿠키에 담아 보냄
         const token = await this.jwtService.signAsync({ email }, { secret: process.env.USER_SECRET_KEY });
         res.cookie("_uu", token, { httpOnly: true, secure: true });
         return { err: null, data: "로그인에 성공하셨습니다. 환영합니다 :)" };
      } catch (e) {
         throw e;
      }
   }
}
