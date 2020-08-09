import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ConsoleModule } from 'nestjs-console';
import { OrmConfiguration } from '@server/config/orm.conf';
import { DotenvConfiguration } from '@server/config/dotenv.conf';
import { AuthModule } from '@server/auth/auth.module';
import { CliUserService } from './cli-user.service';
import { CliService } from './cli.service';

@Module({
  imports: [
    ConsoleModule,
    TypeOrmModule.forRoot(OrmConfiguration),
    ConfigModule.forRoot(DotenvConfiguration),
    AuthModule,
  ],
  providers: [CliService, CliUserService],
})
export class CliModule {}
