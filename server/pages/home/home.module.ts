import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { NextModule } from '@nestpress/next';

@Module({
  imports: [NextModule],
  controllers: [HomeController],
})
export class HomeModule {}
