import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@server/auth/auth.module';
import { PlayerStreamController } from './player-stream.controller';
import { PlayerStreamService } from './player-stream.service';
import { PlayerStream } from './entity/player-stream.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerStream]),
    AuthModule,
  ],
  controllers: [PlayerStreamController],
  providers: [PlayerStreamService],
  exports: [PlayerStreamService],
})
export class PlayerStreamModule {}
