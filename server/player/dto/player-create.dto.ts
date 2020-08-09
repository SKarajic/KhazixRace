import { IsNotEmpty } from 'class-validator';

/**
 * create player
 */
export class PlayerCreateDto {
  @IsNotEmpty()
  name: string;
}