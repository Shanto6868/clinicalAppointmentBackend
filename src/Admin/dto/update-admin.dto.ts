import {
  IsOptional,
  IsNumberString,
  Matches,
  IsString,
  MaxLength,
  IsBoolean,
  IsEmail,
} from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'Full name must be less than 100 characters',
  })
  name?: string;

  @IsOptional()
  @IsNumberString()
  @Matches(/^[0-9]{8,15}$/, {
    message: 'Phone must be 8-15 digits',
  })
  phone?: string;

  @IsOptional()
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@aiub\.edu$/, {
    message: 'Email must be from aiub.edu domain',
  })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/^.{6,}$/, {
    message: 'Password must be at least 6 characters',
  })
  password?: string;
}
