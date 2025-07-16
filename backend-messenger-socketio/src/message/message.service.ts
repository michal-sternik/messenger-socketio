import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ConversationService } from 'src/conversation/conversation.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  async addMessageToConversation(
    senderId: number,
    conversationId: string,
    content: string,
  ) {
    //check if sender is a participant
    const conversation = await this.prismaService.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (
      !conversation ||
      !conversation.participants.some((p) => p.id === senderId)
    ) {
      throw new Error('Sender is not a participant in this conversation');
    }

    return await this.prismaService.message.create({
      data: {
        content,
        sender: { connect: { id: senderId } },
        conversation: { connect: { id: conversationId } },
      },
      include: {
        sender: true,
        conversation: true,
      },
    });
  }

  async startConversationWithFirstMessage(
    senderId: number,
    participantsIds: number[],
    content: string,
  ) {
    const newConversation = await this.conversationService.createConversation(
      senderId,
      { participants: participantsIds },
    );
    return await this.addMessageToConversation(
      senderId,
      newConversation.id,
      content,
    );
  }

  async getConversationMessagesWithCursor(
    userId: number,
    conversationId: string,
    cursor?: string,
    limit: number = 20,
  ) {
    const participant =
      await this.prismaService.conversationParticipant.findFirst({
        where: { conversationId, userId },
      });

    if (!participant) {
      throw new Error('User is not a participant in this conversation');
    }

    //decode cursor
    let decodedCursor: number | undefined;
    if (cursor) {
      try {
        const decoded = Buffer.from(cursor, 'base64').toString();
        decodedCursor = parseInt(decoded);
      } catch {
        throw new Error('Invalid cursor format');
      }
    }

    const messages = await this.prismaService.message.findMany({
      where: {
        conversationId,
        ...(decodedCursor && {
          id: {
            lt: decodedCursor, //less than cursor id
          },
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const hasMore = messages.length === limit;

    //hash cursor (oldest message id from current batch)
    const nextCursor =
      messages.length > 0
        ? Buffer.from(messages[messages.length - 1].id.toString()).toString(
            'base64',
          )
        : null;

    return {
      messages: messages.reverse(),
      hasMore,
      nextCursor,
    };
  }
}
