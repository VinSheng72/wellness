import { ApiProperty } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  companyId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439013' })
  eventItemId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439014' })
  vendorId: string;

  @ApiProperty({
    type: [String],
    example: ['2024-01-15T00:00:00.000Z', '2024-01-16T00:00:00.000Z', '2024-01-17T00:00:00.000Z'],
  })
  proposedDates: Date[];

  @ApiProperty({
    example: { postalCode: '123456', streetName: 'Main Street' },
  })
  location: {
    postalCode: string;
    streetName: string;
  };

  @ApiProperty({ example: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] })
  status: string;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z', required: false })
  confirmedDate?: Date;

  @ApiProperty({ example: 'Unable to accommodate', required: false })
  remarks?: string;

  @ApiProperty({ example: '2024-01-10T00:00:00.000Z' })
  dateCreated: Date;

  @ApiProperty({ example: '2024-01-10T00:00:00.000Z' })
  lastModified: Date;
}
