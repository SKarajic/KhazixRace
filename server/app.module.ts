import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import {
  NextModule,
  NextMiddleware,
} from '@nestpress/next';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';


import { PlayerModule } from './player/player.module';
import { DotenvConfiguration } from './config/dotenv.conf';
import { OrmConfiguration } from './config/orm.conf';
import { AuthModule } from './auth/auth.module';
import { PagesModule } from './pages/pages.module';
import { NotFoundFilter } from './filters/not-found.filter';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    NextModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(OrmConfiguration),
    ConfigModule.forRoot(DotenvConfiguration),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
    PagesModule,
    AuthModule,
    PlayerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: NotFoundFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(NextMiddleware)
      .forRoutes({
        path: '_next*',
        method: RequestMethod.GET,
      });

    consumer
      .apply(NextMiddleware)
      .forRoutes({
        path: 'images/*',
        method: RequestMethod.GET,
      });

    consumer
      .apply(NextMiddleware)
      .forRoutes({
        path: 'favicon.ico',
        method: RequestMethod.GET,
      });
  }
}
