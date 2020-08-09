import { IsNotEmpty, IsEmail } from "class-validator";

export class UserCreateDto {  
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}