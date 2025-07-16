import { IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsArray()
  @ArrayNotEmpty()
  participants: number[];
}
