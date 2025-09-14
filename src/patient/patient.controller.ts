import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './add-patient.dto';
import { ChangePasswordDto } from './change-password-patient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // Register with image upload
  @Post('register')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: CreatePatientDto,
  ) {
    const saved = await this.patientService.register(dto, image?.filename);
    return {
      success: true,
      message: 'Patient registered successfully',
      patient: saved,
    };
  }

  // Login
  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  login(@Body() body: { email: string; password: string }) {
    return this.patientService.login(body.email, body.password);
  }

  // Logout (JWT Protected)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req) {
    const userId = req.user.sub;
    return this.patientService.logout();
  }

  // Change Password (JWT Protected)
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    const userId = req.user.id;
    return this.patientService.changePassword(userId, dto);
  }

  // Get all patients
  @Get()
  getAll() {
    return this.patientService.getAllPatients();
  }

  // Get patient by ID
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.patientService.getPatientById(id);
  }

  // Update status
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'active' | 'inactive',
  ) {
    return this.patientService.updateStatus(id, status);
  }

  // Get inactive patients
  @Get('status/inactive')
  getInactive() {
    return this.patientService.getInactivePatients();
  }

  // Get patients older than X
  @Get('older-than/:age')
  getOlderThan(@Param('age', ParseIntPipe) age: number) {
    return this.patientService.getPatientsOlderThan(age);
  }

  // Delete patient
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.patientService.deletePatient(id);
  }

  // Update Patient Profile
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updatePatient(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: Partial<CreatePatientDto>,
  ) {
    return this.patientService.updatePatient(id, dto, image?.filename);
  }
}
