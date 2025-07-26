import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EvaluationAttemptsService } from './evaluation-attempts.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SameCompanyGuard } from 'src/common/guards';
import { CompanyValidationPipe } from 'src/common/pipes/company-validation.pipe';
import { companyNameToId } from 'src/common/utils';

@ApiBearerAuth()
@UseGuards(AuthGuard(), SameCompanyGuard)
@Controller(':company/evaluation-attempts')
export class EvaluationAttemptsController {
  constructor(
    private readonly evaluationAttemptsService: EvaluationAttemptsService,
  ) {}

  @Get(':attemptId')
  findOne(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('attemptId', ParseIntPipe) attemptId: number,
  ) {
    const companyId = companyNameToId(company);
    return this.evaluationAttemptsService.findOne(companyId, attemptId);
  }
}
