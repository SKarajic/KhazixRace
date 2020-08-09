import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@server/auth/auth.module';
import { RiotApiModule } from '@server/riot-api/riot-api.module';
import { PlayerAccountRanked } from './entity/player-account-ranked.entity';
import { PlayerAccountController } from './player-account.controller';
import { PlayerAccountService } from './player-account.service';
import { PlayerAccount } from './entity/player-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlayerAccountRanked,
      PlayerAccount,
    ]),
    AuthModule,
    RiotApiModule,
  ],
  controllers: [PlayerAccountController],
  providers: [PlayerAccountService],
  exports: [PlayerAccountService],
})
export class PlayerAccountModule {}
