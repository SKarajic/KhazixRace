import { UserCreateDto } from '@server/user/dto/user-create.dto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@server/user/user.service';
import { UserLoginDto } from '@server/user/dto/user-login.dto';
import { JwtPayload } from '@shared/lib/auth';
import { UserDto } from '@server/user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * registers a user
   * 
   * @param register 
   */
  async register(register: UserCreateDto): Promise<UserDto> {
    const user = await this.userService.createUser(register);
    user.auth = this.createToken(user);
    return user;
  }

  /**
   * logs in a user
   * 
   * @param login 
   */
  async login(login: UserLoginDto): Promise<UserDto> {
    const user = await this.userService.findUserByLogin(login);
    user.auth = this.createToken(user);
    return user; 
  }

  /**
   * validates a user
   * 
   * @param payload 
   */
  validateUser(payload: JwtPayload): Promise<UserDto> {
    return this.userService.findUserByPayload(payload);
  }

  /**
   * creates a JWT token
   */
  private createToken({ email }: UserDto): any {
    const user: JwtPayload = { email };
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn: '1h',
      accessToken,
    };
  }
}
