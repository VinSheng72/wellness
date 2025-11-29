import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventItemDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  @ApiProperty({
    example: 'Yoga Class',
    description: 'Name of the event item',
    minLength: 1,
    maxLength: 200,
  })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @ApiPropertyOptional({
    example: 'A relaxing yoga session for all skill levels',
    description: 'Description of the event item',
    maxLength: 1000,
  })
  description?: string;
}
