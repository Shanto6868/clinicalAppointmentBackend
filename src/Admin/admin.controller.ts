import { Controller, Post, Body, Patch, Param, Delete, Get, UsePipes, Put, UseGuards, Req, ForbiddenException, Query } from '@nestjs/common';
import { AdminsService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminValidationPipe } from './pipes/admin-validation.pipe';
import { ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminsService: AdminsService) {}

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
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
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

  // @Get('check-email')
  // async checkEmail(@Query('email') email: string) {
  //   return this.adminsService.checkEmailExists(email);
  // }
}
