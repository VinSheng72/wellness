import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'hr_admin' })
  username: string;

  @ApiProperty({ example: 'HR_ADMIN', enum: ['HR_ADMIN', 'VENDOR_ADMIN'] })
  role: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', required: false })
  companyId?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439013', required: false })
  vendorId?: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
