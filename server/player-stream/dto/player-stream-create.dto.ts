import { IsNotEmpty, IsEnum, IsEmpty, IsUrl } from "class-validator";
import { ApiHideProperty } from '@nestjs/swagger';
import { Player } from "@server/player/entity/player.entity";
import { PlayerStreamPlatform } from "../entity/player-stream-platform.enum";

/**
 * create the stream of a player
 */
export class PlayerStreamCreateDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(PlayerStreamPlatform)
  @IsNotEmpty()
  platform: PlayerStreamPlatform;

  @IsUrl()
  @IsNotEmpty()
  link: string;

  @IsEmpty()
  @ApiHideProperty()
  player: Player;
}
