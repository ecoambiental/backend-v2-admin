import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { FindCourseReviewDto, FindCoursesReviewDto } from './dto';
import { CompanyValidationPipe } from 'src/common/pipes/company-validation.pipe';
import { companyNameToId } from 'src/common/utils';
import { Response } from 'express';

@Controller(':company/reviews/courses')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findCoursesReview(
    @Param('company', CompanyValidationPipe) company: string,
    @Query() findCoursesReviewDto: FindCoursesReviewDto,
  ) {
    const companyId = companyNameToId(company);
    return this.reviewsService.findCoursesReview(
      companyId,
      findCoursesReviewDto,
    );
  }

  @Get('export')
  async exportCoursesReview(
    @Param('company', CompanyValidationPipe) company: string,
    @Query() findCoursesReviewDto: FindCoursesReviewDto,
    @Res() res: Response,
  ) {
    const companyId = companyNameToId(company);
    const buffer = await this.reviewsService.findCoursesReview(
      companyId,
      findCoursesReviewDto,
      true,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=cursos-resena-${company}.xlsx; filename*=UTF-8''cursos-rese%C3%B1a-${company}.xlsx`,
    );
    res.send(buffer);
  }

  @Get(':courseId/summary')
  findCourseSummary(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const companyId = companyNameToId(company);
    return this.reviewsService.findCourseSummary(companyId, courseId);
  }

  @Get(':courseId/reviews')
  findCourseReviews(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query() findCourseReviewDto: FindCourseReviewDto,
  ) {
    const companyId = companyNameToId(company);
    return this.reviewsService.findCourseReviews(
      companyId,
      courseId,
      findCourseReviewDto,
    );
  }

  @Get(':courseId/export')
  async exportCourseReviews(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Res() res: Response,
  ) {
    const companyId = companyNameToId(company);
    const buffer = await this.reviewsService.exportCourseReviews(
      companyId,
      courseId,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=curso-${courseId}.xlsx`,
    );
    res.send(buffer);
  }
}
