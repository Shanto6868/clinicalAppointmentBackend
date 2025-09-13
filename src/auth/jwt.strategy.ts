// jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DoctorService } from '../doctor/doctor.service';
import { PatientService } from '../patient/patient.service';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private doctorService: DoctorService,
    private patientService: PatientService,
    private adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: { sub: number; type: string; email: string }) {
    let user: any;
    
    switch (payload.type) {
      case 'doctor':
        user = await this.doctorService.findById(payload.sub);
        break;
      case 'patient':
        user = await this.patientService.findById(payload.sub);
        break;
      case 'admin':
        user = await this.adminService.findById(payload.sub);
        break;
      default:
        throw new UnauthorizedException('Invalid user type');
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      type: payload.type,
    };
  }
}