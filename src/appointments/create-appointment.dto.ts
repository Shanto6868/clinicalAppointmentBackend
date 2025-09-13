import { IsDateString, IsString, IsNotEmpty, IsInt, IsOptional, IsIn } from 'class-validator';

export class CreateAppointmentDto {
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsInt()
  @IsNotEmpty()
  doctorId: number;

  @IsOptional()
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}
