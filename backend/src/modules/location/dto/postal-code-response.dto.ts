import { ApiProperty } from '@nestjs/swagger';

export class PostalCodeResponseDto {
  @ApiProperty({ example: '123456' })
  postalCode: string;

  @ApiProperty({ example: 'Main Street' })
  streetName: string;

  @ApiProperty({ example: 'Downtown' })
  area?: string;

  @ApiProperty({ example: 'Central District' })
  district?: string;
}
