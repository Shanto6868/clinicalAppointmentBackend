import { IsEmail, IsString, Length, Matches , IsNotEmpty} from 'class-validator';

export class LoginDoctorDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 100)
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])/, { message: 'Password must contain at least one lowercase character' })
  password: string;
}
