import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtPayload } from '@shared/lib/auth';
import { UserDto } from '@server/user/dto/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) { 
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    });  
  }
  
  async validate(payload: JwtPayload): Promise<UserDto> {
    const user = await this.authService.validateUser(payload);
      if (!user) {
        throw new UnauthorizedException('invalid token');
      }
    return user;
  }
}