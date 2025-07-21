import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MessageModule } from '../message/message.module';
import { ConversationParticipantModule } from '../conversation-participant/conversation-participant.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MessageModule, ConversationParticipantModule, AuthModule],
  providers: [SocketGateway],
})
export class SocketModule {}
