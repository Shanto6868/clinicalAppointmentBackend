import { IsString, MaxLength } from 'class-validator';

export class UpdateReasonDto {
  @IsString()
  @MaxLength(200)
  reason: string;
}
