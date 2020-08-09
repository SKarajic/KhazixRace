import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerAccountModule } from '@server/player-account/player-account.module';
import { PlayerStreamModule } from '@server/player-stream/player-stream.module';
import { AuthModule } from '@server/auth/auth.module';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { Player } from './entity/player.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player]),
    PlayerAccountModule,
    PlayerStreamModule,
    AuthModule,
  ],
  providers: [PlayerService],
  controllers: [PlayerController],
})
export class PlayerModule {}
