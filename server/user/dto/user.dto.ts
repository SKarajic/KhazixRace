import { IsNotEmpty, IsEmail, IsOptional } from "class-validator";
import { UserToken } from './user-token.dto';

export class UserDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  auth?: UserToken;
}