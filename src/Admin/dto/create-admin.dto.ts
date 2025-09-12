import {IsEmail,IsString,MinLength,Matches,IsIn,IsNumberString,} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  name: string;
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@aiub\.edu$/, {
    message: 'Email must be from aiub.edu domain',
  })
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  password: string;

  @IsIn(['male', 'female'], {
    message: 'Gender must be either male or female',
  })
  gender: string;

  @IsNumberString()
  @Matches(/^[0-9]+$/, {
    message: 'Phone number must contain only digits',
  })
  phone: string;
}
