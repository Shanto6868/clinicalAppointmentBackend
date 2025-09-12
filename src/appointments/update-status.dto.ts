import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['pending', 'confirmed', 'cancelled'], {
    message: 'Status must be pending, confirmed, or cancelled.',
  })
  status: 'pending' | 'confirmed' | 'cancelled';
}
