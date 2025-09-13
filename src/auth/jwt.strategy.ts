import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DoctorService } from '../doctor/doctor.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private doctorService: DoctorService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret', // ✅ Uses env or fallback
    });
  }

  async validate(payload: { sub: number; role: string }) {
    const doctor = await this.doctorService.findById(payload.sub);

    if (!doctor || !doctor.isActive) {
      throw new UnauthorizedException();
    }

    return {
      id: doctor.id,
      email: doctor.email,
      username: doctor.username,
      fullName: doctor.fullName,
      role: payload.role, // ✅ Include role from JWT
    };
  }
}
