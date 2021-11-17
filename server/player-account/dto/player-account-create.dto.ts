import { IsNotEmpty, IsEnum, IsEmpty } from "class-validator";
import { Player } from '@server/player/entity/player.entity';
import { Regions } from "twisted/dist/constants/regions";
import { ApiHideProperty } from '@nestjs/swagger';

/**
 * create the riot account of a player
 */
export class PlayerAccountCreateDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(Regions)
  @IsNotEmpty()
  region: Regions;

  @IsEmpty()
  @ApiHideProperty()
  player: Player;
}
