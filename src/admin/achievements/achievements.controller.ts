import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { CompanyValidationPipe } from 'src/common/pipes/company-validation.pipe';
import { companyNameToId } from 'src/common/utils';
import {
  CreateAchievementDto,
  CreateDetailDto,
  FindAchievementsDto,
  UpdateAchievementDto,
  UpdateDetailDto,
} from './dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, SameCompanyGuard } from 'src/common/guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Rol } from 'ingepro-entities/dist/entities/enum/user.enum';

@ApiBearerAuth()
@Roles(Rol.Administrador, Rol.SubAdministrador)
@UseGuards(AuthGuard(), RolesGuard, SameCompanyGuard)
@Controller(':company/achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Post()
  createAchievement(
    @Param('company', CompanyValidationPipe) company: string,
    @Body() dto: CreateAchievementDto,
  ) {
    const companyId = companyNameToId(company);
    return this.achievementsService.createAchievement(companyId, dto);
  }

  @Get()
  findAchievements(
    @Param('company', CompanyValidationPipe) company: string,
    @Query() dto: FindAchievementsDto,
  ) {
    const companyId = companyNameToId(company);
    return this.achievementsService.findAchievements(companyId, dto);
  }

  @Patch(':achievementId')
  updateAchievements(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('achievementId', ParseIntPipe) achievementId: number,
    @Body() dto: UpdateAchievementDto,
  ) {
    const companyId = companyNameToId(company);
    return this.achievementsService.updateAchievement(
      companyId,
      achievementId,
      dto,
    );
  }

  @Delete(':achievementId')
  deleteAchievement(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('achievementId', ParseIntPipe) achievementId: number,
  ) {
    const companyId = companyNameToId(company);
    return this.achievementsService.deleteAchievement(companyId, achievementId);
  }

  @Post(':achievementId/details')
  createDetail(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('achievementId', ParseIntPipe) achievementId: number,
    @Body() dto: CreateDetailDto,
  ) {
    const companyId = companyNameToId(company);
    return this.achievementsService.createDetail(companyId, achievementId, dto);
  }

  @Patch(':achievementId/details/:detailId')
  updateDetail(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('achievementId', ParseIntPipe) achievementId: number,
    @Param('detailId', ParseIntPipe) detailId: number,
    @Body() dto: UpdateDetailDto,
  ) {
    const companyId = companyNameToId(company);
    return this.achievementsService.updateDetail(
      companyId,
      achievementId,
      detailId,
      dto,
    );
  }

  @Delete(':achievementId/details/:detailId')
  deleteDetail(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('achievementId', ParseIntPipe) achievementId: number,
    @Param('detailId', ParseIntPipe) detailId: number,
  ) {
    const companyId = companyNameToId(company);
    return this.achievementsService.deleteDetail(
      companyId,
      achievementId,
      detailId,
    );
  }
}
