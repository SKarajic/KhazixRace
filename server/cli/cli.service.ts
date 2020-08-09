import { Console, Command } from 'nestjs-console';
import { Logger } from '@nestjs/common';

@Console()
export class CliService {

  @Command({
    command: 'hello',
  })
  hello() {
    Logger.log('hello world')
  }
}
