import { IsOptional } from 'class-validator';
/**
 * update player
 */
export class PlayerUpdateDto {
  @IsOptional()
  name: string;
}