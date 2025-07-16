import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConversationParticipantService } from './conversation-participant.service';
import { AddUserToConversationDto } from './dtos/add-user-to-conversation.dto';
import { RemoveUserFromConversationDto } from './dtos/remove-user-from-conversation.dto copy';
import { RequestUser } from 'src/auth/types/request-user';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('conversation-participant')
export class ConversationParticipantController {
  constructor(
    private readonly conversationParticipantService: ConversationParticipantService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/addUser/:conversationId')
  addUserToConversation(
    @Req() req: { user: RequestUser },
    @Param('conversationId') conversationId: string,
    @Body() addUserToConversationDto: AddUserToConversationDto,
  ) {
    return this.conversationParticipantService.addParticipantToConversation(
      req.user.id,
      conversationId,
      addUserToConversationDto.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/removeUser/:conversationId')
  removeUserFromConversation(
    @Req() req: { user: RequestUser },
    @Param('conversationId') conversationId: string,
    @Body() removeUserFromConversationDto: RemoveUserFromConversationDto,
  ) {
    return this.conversationParticipantService.removeParticipantFromConversation(
      req.user.id,
      conversationId,
      removeUserFromConversationDto.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUserConversations(@Req() req: { user: RequestUser }) {
    const userId = req.user.id;
    return this.conversationParticipantService.getUserConversationsWithLastMessage(
      userId,
    );
  }
}
