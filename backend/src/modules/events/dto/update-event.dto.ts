import {
  IsMongoId,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
  ValidateNested,
  IsOptional,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from './create-event.dto';

function IsUniqueDates(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUniqueDates',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!Array.isArray(value)) {
            return false;
          }

          // Normalize dates to calendar days (YYYY-MM-DD format)
          const normalizedDates = value.map((dateStr) => {
            try {
              const date = new Date(dateStr);
              return date.toISOString().split('T')[0];
            } catch {
              return dateStr;
            }
          });

          // Check if all normalized dates are unique
          const uniqueDates = new Set(normalizedDates);
          return uniqueDates.size === value.length;
        },
        defaultMessage(args: ValidationArguments) {
          const value = args.value as string[];
          if (!Array.isArray(value)) {
            return 'Proposed dates must be an array';
          }

          // Find and report duplicate dates
          const normalizedDates = value.map((dateStr) => {
            try {
              const date = new Date(dateStr);
              return date.toISOString().split('T')[0];
            } catch {
              return dateStr;
            }
          });

          const seen = new Set<string>();
          const duplicates = new Set<string>();
          normalizedDates.forEach((date) => {
            if (seen.has(date)) {
              duplicates.add(date);
            }
            seen.add(date);
          });

          if (duplicates.size > 0) {
            return `Duplicate dates detected: ${Array.from(duplicates).join(', ')}. All three proposed dates must be unique.`;
          }

          return 'All proposed dates must be unique';
        },
      },
    });
  };
}

export class UpdateEventDto {
  @IsMongoId()
  @IsOptional()
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Event item ID',
    required: false,
  })
  eventItemId?: string;

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsDateString({}, { each: true })
  @IsUniqueDates({
    message:
      'All three proposed dates must be unique (compared by calendar day)',
  })
  @IsOptional()
  @ApiProperty({
    type: [String],
    example: ['2024-01-15', '2024-01-16', '2024-01-17'],
    description: 'Exactly 3 proposed dates in ISO format (must be unique)',
    required: false,
  })
  proposedDates?: string[];

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  @ApiProperty({
    type: LocationDto,
    description: 'Event location',
    required: false,
  })
  location?: LocationDto;
}
