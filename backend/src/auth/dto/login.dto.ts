import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'hr_admin', description: 'Username for login' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'password123', description: 'User password' })
  password: string;
}
