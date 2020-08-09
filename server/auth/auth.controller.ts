import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserDto } from '@server/user/dto/user.dto';
import { UserLoginDto } from '@server/user/dto/user-login.dto';
import { AuthService } from './auth.service';

@Controller('/api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  /**
   * logs in a user
   * 
   * @param login 
   */
  @Post('login')
  login(@Body() login: UserLoginDto): Promise<UserDto> {
    return this.authService.login(login);
  }
}
