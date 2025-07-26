import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CompanyValidationPipe } from 'src/common/pipes/company-validation.pipe';
import { companyNameToId } from 'src/common/utils';
import { AuthGuard } from '@nestjs/passport';
import { SameCompanyGuard } from 'src/common/guards';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard(), SameCompanyGuard)
@Controller('evaluations/:company')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get('attempt/:attemptId')
  findOne(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('attemptId', ParseIntPipe) attemptId: number,
  ) {
    const companyId = companyNameToId(company);
    return this.evaluationsService.findOne(companyId, attemptId);
  }
}
