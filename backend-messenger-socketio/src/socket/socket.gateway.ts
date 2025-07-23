import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';
import { ConversationParticipantService } from '../conversation-participant/conversation-participant.service';
import { SocketMessageDto } from './dtos/socket-message.dto';
import { JwtService } from '@nestjs/jwt';
import { SocketAddUserDto } from './dtos/socket-add-user.dto';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';

interface SocketData {
  userId?: number;
}
type SocketType = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly conversationParticipantService: ConversationParticipantService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: SocketType) {
    try {
      //authorization on connection
      const token =
        client.handshake.headers.authorization?.split(' ')[1] ||
        (client.handshake.auth?.token as string);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect() {}

  @SubscribeMessage('join_conversation')
  async joinConversation(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId as number;

    try {
      //check if the user is a participant
      const participant =
        await this.conversationParticipantService.findParticipant(
          data.conversationId,
          userId,
        );

      if (!participant) {
        client.emit('error', {
          message: 'Not a participant of this conversation',
        });
        return;
      }

      //join the conversation room
      await client.join(data.conversationId);

      client.emit('joined_conversation', {
        conversationId: data.conversationId,
      });
    } catch {
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }
  @SubscribeMessage('add_to_conversation')
  async addToConversation(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: SocketAddUserDto,
  ) {
    const userId = client.data.userId as number;

    try {
      //check if the user is a participant

      await this.conversationParticipantService.addParticipantToConversation(
        userId,
        data.conversationId,
        data.userId,
      );

      //join the conversation room
      await client.join(data.conversationId);

      const sockets = await this.server.fetchSockets();
      const invitedSocket = sockets.find(
        (s) => (s.data as SocketData).userId === data.userId,
      );
      if (invitedSocket) {
        //join the invited user to the room
        invitedSocket.join(data.conversationId);

        this.server.to(data.conversationId).emit('user_added_to_conversation', {
          conversationId: data.conversationId,
          addedUserId: data.userId,
          addedBy: userId,
        });

        //conversation list update
        await this.updateConversationList(data.conversationId);
      }
    } catch (e) {
      client.emit('error', {
        message:
          e instanceof Error ? e.message : 'Failed to add user to conversation',
      });
    }
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: SocketMessageDto,
  ) {
    const userId = client.data.userId as number;

    try {
      //save message to the database
      const message = await this.messageService.addMessageToConversation(
        userId,
        data.conversationId,
        data.content,
      );

      const participants =
        await this.conversationParticipantService.getConversationParticipants(
          data.conversationId,
        );

      const sockets = await this.server.fetchSockets();
      for (const participant of participants) {
        const participantSocket = sockets.find(
          (s) => (s.data as SocketData).userId === participant.userId,
        );
        if (participantSocket) {
          participantSocket.join(data.conversationId);
        }
      }

      //send message to all in the room
      this.server.to(data.conversationId).emit('new_message', {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender,
        conversationId: message.conversationId,
      });

      //update conversation list for all participants
      await this.updateConversationList(data.conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  @SubscribeMessage('start_conversation')
  async startConversation(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: { participantsIds: number[]; content: string },
  ) {
    const userId = client.data.userId as number;
    try {
      //create conversation and send the first message
      const message =
        await this.messageService.startConversationWithFirstMessage(
          userId,
          data.participantsIds,
          data.content,
        );

      const conversationId = message.conversationId;

      //join all participants to the room
      const allParticipants = [userId, ...data.participantsIds];

      for (const participantId of allParticipants) {
        const sockets = await this.server.fetchSockets();
        const participantSocket = sockets.find(
          (s) => (s.data as SocketData).userId === participantId,
        );

        if (participantSocket) {
          participantSocket.join(conversationId);
        }
      }

      //send message to all participants
      this.server.to(conversationId).emit('new_message', {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender.username,
        conversationId: message.conversationId,
      });

      //update conversation list
      await this.updateConversationList(conversationId);
    } catch (error) {
      client.emit('error', {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to start conversation',
      });
    }
  }

  private async updateConversationList(conversationId: string) {
    try {
      //get all participants of the conversation
      const participants =
        await this.conversationParticipantService.getConversationParticipants(
          conversationId,
        );

      //send updated conversation list to all participants
      for (const participant of participants) {
        const conversations =
          await this.conversationParticipantService.getUserConversationsWithLastMessage(
            participant.userId,
          );

        //find user socket and send update
        const sockets = await this.server.fetchSockets();
        const userSocket = sockets.find(
          (s) => (s.data as SocketData).userId === participant.userId,
        );
        if (userSocket) {
          userSocket.emit('conversation_updated', conversations);
        }
      }
    } catch (error) {
      console.error('Failed to update conversation list:', error);
    }
  }
}
