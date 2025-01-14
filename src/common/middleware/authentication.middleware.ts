import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
   constructor(private jwtService: JwtService) {}
   async use(req: Request, res: Response, next: NextFunction) {
      try {
         const { _uu } = req.cookies;
         // 쿠키가 없을 경우
         if (req.cookies === undefined || req.cookies === null) {
            throw new UnauthorizedException("인증되지 않은 사용자입니다. 로그인 후 이용해주세요.");
         }

         const token = _uu;
         // 토큰 검증
         const jwt = await this.jwtService.verifyAsync(token, { secret: process.env.USER_SECRET_KEY }).catch((e) => {
            // 토큰이 만료되었을 경우
            if (e.name === "TokenExpiredError") {
               res.clearCookie("_uu");
               throw new UnauthorizedException("토큰이 만료되었습니다. 다시 로그인해주세요.");
            }
            // jwt 처리 과정에서 잘못된 토큰이나 형식 문제 등이 발생한 경우
            if (e.name === "JsonWebTokenError") {
               res.clearCookie("_uu");
               throw new UnauthorizedException("유효하지 않거나 손상된 토큰입니다. 다시 로그인해주세요.");
            }
         });

         // 검증된 결과를 응답 객체에 저장
         res.locals.user = jwt;
         next();
      } catch (e) {
         throw e;
      }
   }
}
