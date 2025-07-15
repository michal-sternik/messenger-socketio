import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier: string; // email lub username

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  password: string;
}
