
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @Length(6, 100)
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])/, { message: 'Password must contain at least one lowercase character' })
  newPassword: string;
}
