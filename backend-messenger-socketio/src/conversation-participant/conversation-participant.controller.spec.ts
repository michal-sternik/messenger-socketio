import { Test, TestingModule } from '@nestjs/testing';
import { ConversationParticipantController } from './conversation-participant.controller';

describe('ConversationParticipantController', () => {
  let controller: ConversationParticipantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationParticipantController],
    }).compile();

    controller = module.get<ConversationParticipantController>(
      ConversationParticipantController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
