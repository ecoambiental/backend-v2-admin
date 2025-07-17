import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, FindCouponsDto, UpdateCouponDto } from './dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InstitucionValidationPipe } from 'src/common/pipes/institution-validation.pipe';
import { Rol } from 'ingepro-entities/dist/entities/enum/user.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard, SameCompanyGuard } from 'src/common/guards';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @UseGuards(AuthGuard(), RolesGuard, SameCompanyGuard)
  @Roles(Rol.Administrador, Rol.SubAdministrador)
  @Get(':company')
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RolesGuard, SameCompanyGuard)
  @Roles(Rol.Administrador, Rol.SubAdministrador)
  @ApiParam({ name: 'company', type: String })
  @Get(':company')
  findAll(
    @GetUser('companyId')
    companyId: number,
    @Param('company', InstitucionValidationPipe) _: string,
    @Query()
    findCouponsDto: FindCouponsDto,
  ) {
    return this.couponsService.findAll(companyId, findCouponsDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RolesGuard, SameCompanyGuard)
  @Roles(Rol.Administrador, Rol.SubAdministrador)
  @Get(':company/:couponId')
  findOne(
    @Param('company', InstitucionValidationPipe) companyId: number,
    @Param('couponId', ParseIntPipe) couponId: number,
  ) {
    return this.couponsService.findOne(companyId, couponId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(+id, updateCouponDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(+id);
  }
}
