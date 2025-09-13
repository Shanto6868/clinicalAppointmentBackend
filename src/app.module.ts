import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientModule } from './patient/patient.module';
import { AppointmentModule } from './appointments/appointment.module';
import { AuthModule } from './auth/auth.module';
import { Patient } from './patient/patient.entity';
import { AdminModule } from './Admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'pgadmin',
      database: 'clinic_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Patient]),
    AuthModule,
    PatientModule,
    AppointmentModule,
    AdminModule,   // 👈 Register it here
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
