import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'isActive'],
    });

    console.log(admin);

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isMatch = await bcrypt.compare(pass, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const admin = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      sub: admin.id,
      email: admin.email,
    };

    return {
      access_token: this.jwtService.sign(payload, { secret: 'your_hardcoded_secret_here' }),
    };
  }

  logout(token: string) {
    // JWT is stateless, so we don't need to do anything for logout
    // The client should remove the token from their storage
    return token;
  }

  async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const admin = await this.adminRepository.findOne({
      where: { id: Number(adminId) },
      select: ['id', 'password'],
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await this.adminRepository.save(admin);
  }
}
