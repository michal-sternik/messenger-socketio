import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class SocketAddUserDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
