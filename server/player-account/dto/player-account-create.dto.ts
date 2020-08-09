import { IsNotEmpty, IsEnum, IsEmpty } from "class-validator";
import { ApiHideProperty } from '@nestjs/swagger';
import { Player } from '@server/player/entity/player.entity';
import { PlayerAccountRegion } from '../entity/player-account-region.enum';

/**
 * create the riot account of a player
 */
export class PlayerAccountCreateDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(PlayerAccountRegion)
  @IsNotEmpty()
  region: PlayerAccountRegion;

  @IsEmpty()
  @ApiHideProperty()
  player: Player;
}
