import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ConversationParticipantService } from 'src/conversation-participant/conversation-participant.service';

@Injectable()
export class ConversationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly conversationParticipantService: ConversationParticipantService,
  ) {}

  async createConversation(
    creatorId: number,
    createConversationDto: CreateConversationDto,
  ) {
    const isGroup = createConversationDto.participants.length > 1;
    return await this.prismaService.conversation.create({
      data: {
        isGroup,
        participants: {
          create: [
            { user: { connect: { id: creatorId } } },
            ...createConversationDto.participants.map((userId: number) => ({
              user: { connect: { id: userId } },
            })),
          ],
        },
      },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });
  }

  async deleteConversation(userId: number, conversationId: string) {
    const participant =
      await this.prismaService.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId,
        },
      });

    if (!participant) {
      throw new Error('User is not a participant in this conversation');
    }

    return await this.prismaService.conversation.delete({
      where: { id: conversationId },
    });
  }
}
