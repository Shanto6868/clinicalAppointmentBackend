import { Controller, Post, Body, Get, Param, Patch, UsePipes, ValidationPipe, Query, UseGuards, UnauthorizedException } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './create-doctor.dto';
import { UpdateDoctorDto } from './update-doctor.dto';
//import { LoginDoctorDto } from './login-doctor.dto';
import { Appointment } from '../appointments/appointment.entity';
//import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('doctors')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    //private readonly authService: AuthService
  ) {}

   @Post('register')
   @UsePipes(new ValidationPipe())
  async register(@Body() createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    return this.doctorService.register(createDoctorDto);
   }

  // @Post('login')
  // async login(@Body() loginDoctorDto: LoginDoctorDto): Promise<any> {
  //   const doctor = await this.authService.validateDoctor(
  //     loginDoctorDto.email,
  //     loginDoctorDto.password
  //   );
    
  //   if (!doctor) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }

  //   return this.authService.login(doctor);
  // }

  // Protect all routes below with JWT
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Doctor[]> {
    return this.doctorService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: number): Promise<Doctor> {
    return this.doctorService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: number): Promise<Doctor> {
    return this.doctorService.deactivate(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDoctorDto: UpdateDoctorDto
  ): Promise<Doctor> {
    return this.doctorService.update(+id, updateDoctorDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/appointments')
  async getAppointments(
    @Param('id') id: number,
    @Query('date') date?: string
  ): Promise<Appointment[]> {
    if (date) {
     
    }
    return this.doctorService.getAppointments(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/appointments/:appointmentId')
  async updateAppointmentStatus(
    @Param('id') doctorId: number,
    @Param('appointmentId') appointmentId: number,
    @Body('status') status: string
  ): Promise<Appointment> {
    return this.doctorService.updateAppointmentStatus(
      +doctorId,
      +appointmentId,
      status
    );
  }
}