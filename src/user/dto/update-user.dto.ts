import { OmitType } from "@nestjs/mapped-types";
import { createUserDto } from "@user/dto/user.dto";
import { IsOptional, IsString } from "class-validator";

export class updateUserDto extends OmitType(createUserDto, ["confirmPassword"] as const) {
   @IsOptional()
   @IsString({ message: "이미지는 문자열이어야 합니다." })
   readonly image: string | null;
}
