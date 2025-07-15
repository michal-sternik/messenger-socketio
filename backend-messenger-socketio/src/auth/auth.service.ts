import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { PasswordNotMatchException } from 'src/exceptions/exceptions';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new PasswordNotMatchException();
    }
    const existingUser = await this.userService.getUserByEmailOrUsername(
      registerDto.email,
      registerDto.username,
    );
    if (existingUser) throw new ForbiddenException('Email already in use');

    const salt = await bcrypt.genSalt();
    registerDto.password = await bcrypt.hash(registerDto.password, salt);

    const newUser = await this.userService.saveUser(registerDto);

    return newUser.id;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.getUserByEmailOrUsername(
      loginDto.identifier,
      loginDto.identifier,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }

  async validateUser(id: number) {
    return await this.userService.getUserById(id);
  }
}
