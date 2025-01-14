import { PickType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class createUserDto {
   @IsEmail({}, { message: "올바른 이메일 형식이 아닙니다." })
   readonly email: string;

   @IsNotEmpty({ message: "이름을 입력해주세요." })
   @IsString({ message: "이름은 문자열이어야 합니다." })
   readonly name: string;

   @IsNotEmpty({ message: "비밀번호를 입력해주세요." })
   @IsString({ message: "비밀번호는 문자열이어야 합니다." })
   @MinLength(8, { message: "비밀번호는 8글자 이상이어야 합니다." })
   @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
      message: "비밀번호는 영문자, 숫자, 특수문자를 모두 포함하여야 합니다.",
   })
   readonly password: string;

   @IsNotEmpty({ message: "비밀번호를 입력해주세요." })
   @IsString({ message: "비밀번호는 문자열이어야 합니다." })
   readonly confirmPassword: string;
}

export class signInUserDto extends PickType(createUserDto, ["email", "password"]) {}
