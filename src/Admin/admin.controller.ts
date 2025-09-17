import { 
  Controller, Post, Body, Patch, Param, Delete, Get, 
  UsePipes, Put, UseGuards, Req, ForbiddenException, 
  Query, ParseIntPipe 
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminValidationPipe } from './pipes/admin-validation.pipe';
import { ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { AdminsService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChangePasswordDto } from './change-password.dto';
import { Admin } from 'typeorm';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminsService: AdminsService,
  ) {}
  
 

  // Admin Authentication Routes
  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  login(@Body() body: { email: string; password: string }) {
    return this.adminsService.login(body.email, body.password);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: Request) {
    // If your JWT payload uses 'sub' as the user identifier, use 'sub' instead of 'id'
    return this.adminsService.logout();
  }

    @Patch('change-password')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async changePassword(@Req() req,@Body() dto: ChangePasswordDto) {
      const userId = req.user.id;
      return this.adminsService.changePassword(userId,dto.currentPassword, dto.newPassword );
    }

  
  @Post()
  @UsePipes(AdminValidationPipe)
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.createAdmin(createAdminDto);
  }

  @Patch(':id/phone')
  @UseGuards(JwtAuthGuard)
  async updatePhone(
    @Param('id') id: number,
    @Body(new AdminValidationPipe()) updateAdminDto: UpdateAdminDto,
  ) {
    return await this.adminsService.updatePhone(id, updateAdminDto);
  }

  @Get('null-fullnames')
  @UseGuards(JwtAuthGuard)
  findNullFullNames() {
    return this.adminsService.findNullFullNames();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: number) {
    return this.adminsService.remove(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  async updateAdmin(
    @Param('id') id: number,
    @Body() updateAdminDto: UpdateAdminDto,
    @Req() req: Request,
  ) {
    if (req.user && req.user['sub'] !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.adminsService.updateAdmin(id, updateAdminDto);
  }

  // Patient Management Routes (Protected)
  @Get('patients')
  @UseGuards(JwtAuthGuard)
  getAllPatients() {
    return this.adminsService.getAllPatients();
  }

  @Get('patients/:id')
  @UseGuards(JwtAuthGuard)
  getPatientById(@Param('id', ParseIntPipe) id: number) {
    return this.adminsService.getPatientById(id);
  }

  @Get('patients/status/inactive')
  @UseGuards(JwtAuthGuard)
  getInactivePatients() {
    return this.adminsService.getInactivePatients();
  }

  @Get('patients/older-than/:age')
  @UseGuards(JwtAuthGuard)
  getPatientsOlderThan(@Param('age', ParseIntPipe) age: number) {
    return this.adminsService.getPatientsOlderThan(age);
  }

  @Patch('patients/:id/status')
  @UseGuards(JwtAuthGuard)
  updatePatientStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'active' | 'inactive',
  ) {
    return this.adminsService.updatePatientStatus(id, status);
  }

  @Delete('patients/:id')
  @UseGuards(JwtAuthGuard)
  deletePatient(@Param('id', ParseIntPipe) id: number) {
    return this.adminsService.deletePatient(id);
  }

  // Doctor Management Routes (Protected)
  @Get('doctors')
  @UseGuards(JwtAuthGuard)
  getAllDoctors() {
    return this.adminsService.getAllDoctors();
  }

  @Get('doctors/:id')
  @UseGuards(JwtAuthGuard)
  getDoctorById(@Param('id', ParseIntPipe) id: number) {
    return this.adminsService.getDoctorById(id);
  }

  @Get('doctors/:id/appointments')
  @UseGuards(JwtAuthGuard)
  getDoctorAppointments(@Param('id', ParseIntPipe) id: number) {
    return this.adminsService.getDoctorAppointments(id);
  }

  @Patch('doctors/:id/appointments/:appointmentId')
  @UseGuards(JwtAuthGuard)
  updateDoctorAppointmentStatus(
    @Param('id', ParseIntPipe) doctorId: number,
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @Body('status') status: string,
  ) {
    return this.adminsService.updateDoctorAppointmentStatus(doctorId, appointmentId, status);
  }

  // Additional Admin Doctor Management Routes
  @Patch('doctors/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateDoctorStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminsService.updateDoctorStatus(id, isActive);
  }

  @Get('doctors/stats/count')
  @UseGuards(JwtAuthGuard)
  async getDoctorCount() {
    return this.adminsService.getDoctorCount();
  }

  @Get('doctors/stats/specializations')
  @UseGuards(JwtAuthGuard)
  async getDoctorSpecializationStats() {
    return this.adminsService.getDoctorSpecializationStats();
  }

  @Get('doctors/status/inactive')
  @UseGuards(JwtAuthGuard)
  async getInactiveDoctors() {
    return this.adminsService.getInactiveDoctors();
  }

  // Dashboard Statistics (Protected)
  @Get('stats/patients/count')
  @UseGuards(JwtAuthGuard)
  async getPatientCount() {
    return this.adminsService.getPatientCount();
  }

  @Get('stats/patients/status')
  @UseGuards(JwtAuthGuard)
  async getPatientStatusStats() {
    return this.adminsService.getPatientStatusStats();
  }

  @Get('stats/patients/age-distribution')
  @UseGuards(JwtAuthGuard)
  async getAgeDistribution() {
    return this.adminsService.getAgeDistribution();
  }

  @Get('stats/overview')
  @UseGuards(JwtAuthGuard)
  async getDashboardOverview() {
    return this.adminsService.getDashboardOverview();
  }
}