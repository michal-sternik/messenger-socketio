import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { RequestUser } from 'src/auth/types/request-user';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchUsers(
    @Query('searchPhrase') searchPhrase: string,
    @Req() req: { user: RequestUser },
  ) {
    return this.userService.searchUsers(searchPhrase, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserInfo(@Req() req: { user: RequestUser }) {
    return this.userService.getUserById(req.user.id);
  }
}
