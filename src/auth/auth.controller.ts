import { Controller, Post, Body, UnauthorizedException, Put, UseGuards, Request  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDoctorDto } from '../doctor/login-doctor.dto';
import { ChangePasswordDto } from '../doctor/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDoctorDto: LoginDoctorDto): Promise<any> {
    const doctor = await this.authService.validateDoctor(
      loginDoctorDto.email,
      loginDoctorDto.password
    );
    
    if (!doctor) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(doctor);
  }
   @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto): Promise<any> {
    const doctorId = req.user.id;
    const { currentPassword, newPassword } = changePasswordDto;
    
    const result = await this.authService.changePassword(doctorId, currentPassword, newPassword);
    
    return { message: 'Password changed successfully' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(): Promise<any> {
    // In a stateless JWT system, logout is handled on the client side by removing the token
    // We could implement a token blacklist here if needed
    return { message: 'Logged out successfully' };
  }
}