import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  imports: [ConversationModule],
  controllers: [MessageController],
  providers: [MessageService, PrismaService],
  exports: [MessageService],
})
export class MessageModule {}
