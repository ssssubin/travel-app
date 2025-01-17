import { Injectable } from "@nestjs/common";
import { Strategy } from "passport-naver";
import { PassportStrategy } from "@nestjs/passport";

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, "naver") {
   constructor() {
      super({
         clientID: process.env.NAVER_CLIENT_ID,
         clientSecret: process.env.NAVER_CLIENT_SECRET,
         callbackURL: process.env.NAVER_REDIRECT_URL,
         scope: ["profile"],
      });
   }

   async validate(accessToken: string, refreshToken: string, profile: any) {
      try {
         const { emails } = profile;
         const user = {
            email: emails[0].value,
         };

         return user;
      } catch (e) {
         throw e;
      }
   }
}
