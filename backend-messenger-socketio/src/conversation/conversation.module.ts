import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConversationParticipantModule } from 'src/conversation-participant/conversation-participant.module';

@Module({
  imports: [ConversationParticipantModule],
  controllers: [ConversationController],
  providers: [ConversationService, PrismaService],
})
export class ConversationModule {}
