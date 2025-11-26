import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @ApiProperty({
    example: 'Unable to accommodate due to scheduling conflicts',
    description: 'Reason for rejection (cannot be empty)',
  })
  remarks: string;
}
