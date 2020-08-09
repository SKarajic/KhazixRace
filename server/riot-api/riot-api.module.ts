import { Module } from '@nestjs/common';
import { RiotApiService } from './riot-api.service';

@Module({
  providers: [RiotApiService],
  exports: [RiotApiService],
})
export class RiotApiModule {}
