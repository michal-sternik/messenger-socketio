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
    return await this.prismaService.conversationParticipant.findFirst({
      where: { userId },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { sender: true },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });
  }
}
