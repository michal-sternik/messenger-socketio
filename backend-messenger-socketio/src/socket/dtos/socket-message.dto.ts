import { IsString, IsNotEmpty } from 'class-validator';

export class SocketMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
