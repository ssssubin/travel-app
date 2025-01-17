import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-kakao";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakako") {
   constructor() {
      super({
         clientID: process.env.KAKAO_CLIENT_ID,
         callbackURL: process.env.KAKAO_REDIRECT_URL,
      });
   }

   async validate(accessToken: string, refreshToken: string, profile: Profile) {
      try {
         const { _json } = profile;
         const user = {
            email: _json.kakao_account.email,
         };

         return user;
      } catch (e) {
         throw e;
      }
   }
}
