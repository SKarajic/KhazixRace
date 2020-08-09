import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm';
import { Player } from '@server/player/entity/player.entity';
import { PlayerAccountRanked } from './player-account-ranked.entity';
import { PlayerAccountRegion } from './player-account-region.enum';

/**
 * the league account of a player
 */
@Entity()
export class PlayerAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  riotId: string;

  @Column()
  lolId: string;

  @Column({ type: 'varchar' })
  region: PlayerAccountRegion;

  @ManyToOne(type => Player, player => player.accounts, { onDelete: 'CASCADE' })
  player: Player;

  @OneToOne(type => PlayerAccountRanked, ranked => ranked.account)
  ranked: PlayerAccountRanked;
}
