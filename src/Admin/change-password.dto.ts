import { IsString, MinLength,Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-z])/, { message: 'Password must contain at least one lowercase character' })
  newPassword:string;
}