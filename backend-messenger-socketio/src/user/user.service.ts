import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from 'src/auth/dtos/register.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getUserByEmailOrUsername(email: string, username: string) {
    return await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  async saveUser(registerDtoWithHashedPassword: RegisterDto) {
    const { email, password: hashed, username } = registerDtoWithHashedPassword;
    return await this.prisma.user.create({
      data: { email, password: hashed, username },
    });
  }
}
