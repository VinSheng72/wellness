import {
  IsMongoId,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
  ValidateNested,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123456', description: 'Postal code' })
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Main Street', description: 'Street name' })
  streetName: string;
}

export class CreateEventDto {
  @IsMongoId()
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Event item ID',
  })
  eventItemId: string;

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsDateString({}, { each: true })
  @ApiProperty({
    type: [String],
    example: ['2024-01-15', '2024-01-16', '2024-01-17'],
    description: 'Exactly 3 proposed dates in ISO format',
  })
  proposedDates: string[];

  @ValidateNested()
  @Type(() => LocationDto)
  @ApiProperty({ type: LocationDto, description: 'Event location' })
  location: LocationDto;
}
