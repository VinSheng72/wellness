import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveEventDto {
  @IsDateString()
  @ApiProperty({
    example: '2024-01-15',
    description: 'Confirmed date (must be one of the proposed dates)',
  })
  confirmedDate: string;
}
