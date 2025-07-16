import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { RequestUser } from 'src/auth/types/request-user';
import { SendMessageDto } from './dtos/send-message.dto';
import { FirstMessageDto } from './dtos/first-message.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':conversationId')
  sendMessageToConversation(
    @Req() req: { user: RequestUser },
    @Param('conversationId') conversationId: string,
    @Body() messageDto: SendMessageDto,
  ) {
    const senderId = req.user.id;
    return this.messageService.addMessageToConversation(
      senderId,
      conversationId,
      messageDto.content,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  startConversationWithFirstMessage(
    @Req() req: { user: RequestUser },
    @Body() firstMessageDto: FirstMessageDto,
  ) {
    const senderId = req.user.id;
    const participantsIds = firstMessageDto.participants;
    const content = firstMessageDto.content;

    return this.messageService.startConversationWithFirstMessage(
      senderId,
      participantsIds,
      content,
    );
  }

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
