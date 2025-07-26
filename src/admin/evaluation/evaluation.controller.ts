import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SameCompanyGuard } from 'src/common/guards';
import { CompanyValidationPipe } from 'src/common/pipes/company-validation.pipe';
import { companyNameToId } from 'src/common/utils';

// @ApiBearerAuth()
// @UseGuards(AuthGuard(), SameCompanyGuard)
@Controller(':company/evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Get(':evaluationId/student/:studentId')
  findEvaluationAttemptsByStudent(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('evaluationId', ParseIntPipe) evaluationId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    const companyId = companyNameToId(company);
    return this.evaluationService.findEvaluationAttemptsByStudent(
      companyId,
      evaluationId,
      studentId,
    );
  }
}
