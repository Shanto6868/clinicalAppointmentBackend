// auth.controller.ts
import { Controller, Post, Body, UnauthorizedException, Put, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { ChangePasswordDto } from './change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.type
    );
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user, loginDto.type);
  }

  // CHANGE PASSWORD FOR DOCTORS ONLY
  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto): Promise<any> {
    // Check if the user is a doctor
    if (req.user.type !== 'doctor') {
      throw new ForbiddenException('Only doctors can change passwords through this endpoint');
    }
    
    const doctorId = req.user.id;
    const { currentPassword, newPassword } = changePasswordDto;
    
    const result = await this.authService.changePassword(doctorId, currentPassword, newPassword);
    
    return { message: 'Password changed successfully' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(): Promise<any> {
    return { message: 'Logged out successfully' };
  }
}