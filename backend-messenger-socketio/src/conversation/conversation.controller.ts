import {
  Body,
  Controller,
  Delete,
  Injectable,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestUser } from 'src/auth/types/request-user';

@Injectable()
@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createConversation(
    @Req() req: { user: RequestUser },
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const userId = req.user.id;
    return this.conversationService.createConversation(
      userId,
      createConversationDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteConversation(
    @Req() req: { user: RequestUser },
    @Param('id') conversationId: string,
  ) {
    const userId = req.user.id;
    return this.conversationService.deleteConversation(userId, conversationId);
  }
}
