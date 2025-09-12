import { Type } from 'class-transformer';
import { IsString, IsEmail, Matches, MaxLength, IsInt, Min, IsOptional, IsEnum } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @Matches(/^[A-Za-z\s]+$/, { message: 'Full name must contain only alphabets and spaces.' })
  @MaxLength(100, { message: 'Full name cannot exceed 100 characters.' })
  fullName: string;

  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @Type(() => Number) 
  @IsInt({ message: 'Age must be an integer.' })
  @Min(0, { message: 'Age must be a positive number.' })
  age: number;

  @IsEnum(['male', 'female', 'other'], { message: 'Gender must be male, female, or other.' })
  gender: 'male' | 'female' | 'other';

  @IsOptional()
  @IsString({ message: 'Image must be a string (filename).' })
  image?: string;

  @IsString()
  @MaxLength(255, { message: 'Password is too long.' })
  password: string;

  @IsString()
  @MaxLength(255, { message: 'Address is too long.' })
  address: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'], { message: 'Status must be active or inactive.' })
  status?: 'active' | 'inactive';
}
