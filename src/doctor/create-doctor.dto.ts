import { IsString, IsNotEmpty, Matches, Length, IsEmail, IsInt, Min, Max } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  username: string;

   @IsString()
  @IsNotEmpty()
  @Length(1, 150)
  fullName: string;  

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 100)
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])/, { message: 'Password must contain at least one lowercase character' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^01/, { message: 'Phone number must start with 01' })
  phone: string;

@IsString()
@IsNotEmpty({ message: 'Specialization is required' })
specialization: string;

   @IsInt()
  @Min(0)
  @Max(40)
  @IsNotEmpty()
  experience: number;
}
