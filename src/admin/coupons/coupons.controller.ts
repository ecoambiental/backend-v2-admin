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
import { GetUserSelection } from 'src/auth/interfaces/jwt-payload.interfaces';

@ApiBearerAuth()
@Roles(Rol.Administrador, Rol.SubAdministrador)
@UseGuards(AuthGuard(), RolesGuard, SameCompanyGuard)
@Controller('coupons/:company')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  create(
    @GetUser(['companyId', 'userName', 'userSurnames', 'userId'])
    tokenData: GetUserSelection<
      'companyId' | 'userName' | 'userSurnames' | 'userId'
    >,
    @Param('company', InstitucionValidationPipe) _: string,
    @Body() createCouponDto: CreateCouponDto,
  ) {
    return this.couponsService.create(tokenData, createCouponDto);
  }

  @Get()
  findAll(
    @GetUser('companyId')
    companyId: number,
    @Param('company', InstitucionValidationPipe) _: string,
    @Query()
    findCouponsDto: FindCouponsDto,
  ) {
    return this.couponsService.findAll(companyId, findCouponsDto);
  }

  @Get(':couponId')
  findOne(
    @GetUser('companyId')
    companyId: number,
    @Param('company', InstitucionValidationPipe) _: string,
    @Param('couponId', ParseIntPipe) couponId: number,
  ) {
    return this.couponsService.findOne(companyId, couponId);
  }

  @Patch(':couponId')
  update(
    @GetUser('companyId')
    companyId: number,
    @Param('company', InstitucionValidationPipe) _: string,
    @Param('couponId', ParseIntPipe) id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponsService.update(companyId, id, updateCouponDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(+id);
  }
}
