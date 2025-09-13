import {IsOptional, IsString, Length,  Matches, IsEmail,  } from 'class-validator';

export class UpdateDoctorDto {
  @IsString()
  @Length(1, 150)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^01/, { message: 'Phone number must start with 01' })
  phone: string;
  
   @IsString()
  @Length(6, 100)
  @Matches(/^(?=.*[a-z])/, { message: 'Password must contain at least one lowercase character' })
  password: string;


 @IsOptional()
  @IsString()
  specialties: string[];

}