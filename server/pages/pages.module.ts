import { Module } from '@nestjs/common';
import { HomeModule } from './home/home.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PagesInterceptor } from './pages.interceptor';
import { PagesController } from './pages.controller';
import { NextModule } from '@nestpress/next';

@Module({
  imports: [
    HomeModule,
    NextModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: PagesInterceptor,
    },
  ],
  controllers: [PagesController],
})
export class PagesModule {}
