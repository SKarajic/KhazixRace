import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column } from 'typeorm';
import { PlayerAccount } from './player-account.entity';

/**
 * the ranked stats of a riot account
 */
@Entity()
export class PlayerAccountRanked {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tier: string;

  @Column()
  division: string;

  @Column()
  points: number;

  @Column()
  wins: number;

  @Column()
  losses: number;

  @OneToOne(type => PlayerAccount, account => account.ranked, { onDelete: 'CASCADE' })
  @JoinColumn()
  account: PlayerAccount;
}
