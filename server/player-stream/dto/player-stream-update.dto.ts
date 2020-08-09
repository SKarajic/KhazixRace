import { IsOptional, IsEnum, IsUrl } from "class-validator";
import { PlayerStreamPlatform } from "../entity/player-stream-platform.enum";

/**
 * update the stream of a player
 */
export class PlayerStreamUpdateDto {
  @IsOptional()
  name: string;

  @IsEnum(PlayerStreamPlatform)
  @IsOptional()
  platform: PlayerStreamPlatform;

  @IsUrl()
  @IsOptional()
  link: string;
}
