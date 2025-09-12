import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminsService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { AuthModule } from '../auth/auth.module'; // 👈 import AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    AuthModule, // 👈 gives access to JwtService, Passport strategies, etc.
  ],
  controllers: [AdminController],
  providers: [AdminsService],
  exports: [AdminsService, TypeOrmModule],
})
export class AdminModule {}
