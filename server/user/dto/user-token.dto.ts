import { IsNotEmpty } from "class-validator"

/**
 * user access token
 */
export class UserToken {
  @IsNotEmpty()
  expiresIn: string;

  @IsNotEmpty()
  accessToken: string;
}