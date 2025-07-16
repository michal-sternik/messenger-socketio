import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConversationModule } from './conversation/conversation.module';
import { ConversationParticipantModule } from './conversation-participant/conversation-participant.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, UserModule, ConversationModule, ConversationParticipantModule, MessageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
