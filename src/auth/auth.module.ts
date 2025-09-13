import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { DoctorModule } from '../doctor/doctor.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    DoctorModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret', // ✅ Uses env var
      signOptions: { expiresIn: '1d' }, // ✅ Adjust as needed
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
