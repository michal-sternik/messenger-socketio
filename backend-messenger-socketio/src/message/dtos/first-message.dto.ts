import { IsArray, IsNotEmpty } from 'class-validator';

export class FirstMessageDto {
  @IsNotEmpty()
  content: string;
  @IsArray()
  @IsNotEmpty()
  participants: number[];
}
