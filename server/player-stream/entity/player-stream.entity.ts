import { Player } from '@server/player/entity/player.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { PlayerStreamPlatform } from './player-stream-platform.enum';

/**
 * the stream of a player
 */
@Entity()
export class PlayerStream {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  platform: PlayerStreamPlatform;

  @Column()
  link: string;

  @ManyToOne(type => Player, player => player.streams, { onDelete: 'CASCADE' })
  player: Player;
}
