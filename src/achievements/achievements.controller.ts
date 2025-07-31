import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { CompanyValidationPipe } from 'src/common/pipes/company-validation.pipe';
import { companyNameToId } from 'src/common/utils';
import {
  CreateAchievementDto,
  FindAchievementsDto,
  UpdateAchievementDto,
} from './dto';

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
}
