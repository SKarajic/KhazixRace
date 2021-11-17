import { Console, Command } from 'nestjs-console';
import { Logger } from '@nestjs/common';
import * as prompt from 'prompt';

import { UserCreateDto } from '@server/user/dto/user-create.dto';
import { AuthService } from '@server/auth/auth.service';

const loginSchema = {
  properties: {
    email: {
      pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: 'Please enter a valid email',
      required: true,
    },
    password: {
      hidden: true,
      required: true,
    }
  }
};

@Console()
export class CliUserService {
  constructor(private readonly authService: AuthService) {}

  @Command({
    command: 'user:create',
  })
  async hello() {
    try {
      const user: UserCreateDto = await new Promise((resolve, reject) => {
        prompt.start();
        prompt.get(loginSchema, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result)
        });
      })
      await this.authService.register(user);
      Logger.log(`successfully created user with email: '${user.email}'`);
    } catch (e: any) {
      Logger.error(`unable to create a user: ${e.message}`);
    }
  }
}
