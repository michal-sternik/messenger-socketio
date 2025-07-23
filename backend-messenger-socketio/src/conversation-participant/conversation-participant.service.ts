import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ConversationParticipantService {
  constructor(private readonly prismaService: PrismaService) {}

  async addParticipantToConversation(
    userThatAddsId: number,
    conversationId: string,
    userId: number,
  ) {
    const conversation = await this.prismaService.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }
    if (!conversation.isGroup) {
      throw new BadRequestException(
        'Cannot add participants to non-group conversation',
      );
    }

    const addingUserExists =
      await this.prismaService.conversationParticipant.findFirst({
        where: { conversationId, userId: userThatAddsId },
      });
    if (!addingUserExists) {
      throw new BadRequestException(
        'User adding participant is not a member of this conversation',
      );
    }

    const exists = await this.prismaService.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });
    if (exists) {
      throw new ConflictException(
        'User is already a participant in this conversation',
      );
    }
    return this.prismaService.conversationParticipant.create({
      data: {
        conversationId,
        userId,
      },
    });
  }

  async removeParticipantFromConversation(
    userThaRemovesId: number,
    conversationId: string,
    userId: number,
  ) {
    const conversation = await this.prismaService.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }
    if (!conversation.isGroup) {
      throw new BadRequestException(
        'Cannot remove participants from non-group conversation',
      );
    }

    const removingUserExists =
      await this.prismaService.conversationParticipant.findFirst({
        where: { conversationId, userId: userThaRemovesId },
      });
    if (!removingUserExists) {
      throw new BadRequestException(
        'User removing participant is not a member of this conversation',
      );
    }

    const userExists =
      await this.prismaService.conversationParticipant.findFirst({
        where: { conversationId, userId },
      });
    if (!userExists) {
      throw new BadRequestException(
        'User is not a participant in this conversation',
      );
    }
    return this.prismaService.conversationParticipant.delete({
      where: { id: userExists.id },
    });
  }
  async getUserConversationsWithLastMessage(userId: number) {
    const participants =
      await this.prismaService.conversationParticipant.findMany({
        where: { userId },
        select: {
          id: true,
          conversationId: true,
          conversation: {
            select: {
              updatedAt: true,
              isGroup: true,
              participants: {
                select: {
                  id: true,
                  user: {
                    select: {
                      username: true,
                    },
                  },
                },
              },
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                  id: true,
                  content: true,
                  sender: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { conversation: { updatedAt: 'desc' } },
      });

    //desired shape of return
    return participants.map((p) => ({
      id: p.id,
      conversationId: p.conversationId,
      conversation: {
        updatedAt: p.conversation.updatedAt,
        isGroup: p.conversation.isGroup,
        message: p.conversation.messages[0] || null,
        participants: p.conversation.participants.map((part) => ({
          id: part.id,
          username: part.user.username,
        })),
      },
    }));
  }

  async findParticipant(conversationId: string, userId: number) {
    return await this.prismaService.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });
  }

  async getConversationParticipants(conversationId: string) {
    return await this.prismaService.conversationParticipant.findMany({
      where: { conversationId },
      include: { user: true },
    });
  }
}
