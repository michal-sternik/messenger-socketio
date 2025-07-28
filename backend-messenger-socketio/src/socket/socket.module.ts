import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MessageModule } from '../message/message.module';
import { ConversationParticipantModule } from '../conversation-participant/conversation-participant.module';
import { AuthModule } from '../auth/auth.module';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  imports: [
    MessageModule,
    ConversationParticipantModule,
    AuthModule,
    ConversationModule,
  ],
  providers: [SocketGateway],
})
export class SocketModule {}
