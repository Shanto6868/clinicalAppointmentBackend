import {IsString,MaxLength,IsIn,IsOptional,IsDateString,} from 'class-validator';

export class CreateAppointmentDto {
  @IsDateString({}, { message: 'dateTime must be a valid ISO date-time string.' })
  dateTime: string; 

  @IsString()
  @MaxLength(200, { message: 'Reason cannot exceed 200 characters.' })
  reason: string;

  @IsOptional()
  @IsIn(['pending', 'confirmed', 'cancelled'], {
    message: 'Status must be pending, confirmed, or cancelled.',
  })
  status?: 'pending' | 'confirmed' | 'cancelled';
}
