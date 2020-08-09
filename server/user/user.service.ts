import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';

import { JwtPayload } from '@shared/lib/auth';
import { UserCreateDto } from './dto/user-create.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * creates a user
   * 
   * @param user 
   */
  async createUser(user: UserCreateDto): Promise<UserDto> {
    const foundUser =  await this.userRepo.findOne({ where: { email: user.email }});
    if (foundUser) {
      throw new BadRequestException('email already in use');
    }
    const createdUser = await this.userRepo.create(user);
    await this.userRepo.save(createdUser);
    return this.userToDto(createdUser);
  }

  /**
   * finds a user using login details
   * 
   * @param email 
   */
  async findUserByLogin(login: UserLoginDto): Promise<UserDto> {
    let user: User;
    try {
      user = await this.findUserByEmail(login.email);
      const isCorrect = await this.verifyPassword(login.password, user.password);
      if (!isCorrect) throw new Error();
    } catch {
      throw new UnauthorizedException('email or password is incorrect')
    }
    return this.userToDto(user);
  }

  /**
   * finds a user by payload
   */
  async findUserByPayload({ email }: JwtPayload): Promise<UserDto> {
    let user: User;
    try {
      user = await this.findUserByEmail(email);
    } catch {
      throw new UnauthorizedException('invalid token')
    }
    return this.userToDto(user);
  }

  /**
   * finds a user by email
   * 
   * @param email 
   */
  private async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email }});
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  /**
   * compares two passwords
   * 
   * @param password 
   * @param passHash 
   */
  private verifyPassword(password: string, passHash: string): Promise<boolean> {
    return compare(password, passHash);
  }

  /**
   * maps user to dto
   */
  private userToDto({ id, email }: User): UserDto {
    return { id, email };
  }
}
