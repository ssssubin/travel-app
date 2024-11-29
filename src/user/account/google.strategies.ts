import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
   constructor() {
      super({
         clientID: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_SECRET_KEY,
         callbackURL: process.env.GOOGLE_CALLBACK_URL,
         scope: ["email", "profile"],
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
