import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { Doctor } from './doctor.entity';
import { Appointment } from '../appointments/appointment.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';



@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, Appointment]),
    JwtModule.register({
          secret: process.env.JWT_SECRET || 'dev-secret', // use env in prod
          signOptions: { expiresIn: '1d' },
        }),
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService]
})
export class DoctorModule {}