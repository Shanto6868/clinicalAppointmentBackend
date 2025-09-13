import { IsDateString, IsString, IsOptional,IsIn } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  patientName?: string;

  @IsOptional()
  @IsDateString()
  date?: Date;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  status?: string;
}