import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from 'src/auth/dtos/register.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async searchUsers(searchPhrase: string, requestingUserId?: number) {
    return await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: searchPhrase, mode: 'insensitive' } },
          { email: { contains: searchPhrase, mode: 'insensitive' } },
        ],
        //do not return yourself
        NOT: { id: requestingUserId },
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
      take: 10,
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
