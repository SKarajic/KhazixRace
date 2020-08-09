import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PlayerStream } from '@server/player-stream/entity/player-stream.entity';
import { PlayerAccount } from '@server/player-account/entity/player-account.entity';

/**
 * the tracked player
 */
@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(type => PlayerStream, stream => stream.player)
  streams: PlayerStream[]

  @OneToMany(type => PlayerAccount, account => account.player)
  accounts: PlayerAccount[]
}
