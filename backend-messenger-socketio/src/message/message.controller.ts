import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { RequestUser } from 'src/auth/types/request-user';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':conversationId/cursor')
  getConversationMessagesWithCursor(
    @Req() req: { user: RequestUser },
    @Param('conversationId') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit: number = 20,
  ) {
    const userId = req.user.id;
    return this.messageService.getConversationMessagesWithCursor(
      userId,
      conversationId,
      cursor,
      limit,
    );
  }
}
