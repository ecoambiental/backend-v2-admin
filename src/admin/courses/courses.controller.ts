import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CompanyValidationPipe } from 'src/common/pipes/company-validation.pipe';
import { companyNameToId } from '../../common/utils/company-name-to-id';
import { FindCourseForCouponDto, FindCoursesForCouponDto } from './dto';

@Controller('courses/:company')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // @Post()
  // create(@Body() createCourseDto: CreateCourseDto) {
  //   return this.coursesService.create(createCourseDto);
  // }

  // @Get()
  // findAll() {
  //   return this.coursesService.findAll();
  // }

  @Get('for-coupon')
  findCoursesForCoupon(
    @Param('company', CompanyValidationPipe) company: string,
    @Query() dto: FindCoursesForCouponDto,
  ) {
    const companyId = companyNameToId(company);
    return this.coursesService.findCoursesForCoupon(companyId, dto);
  }

  @Get('/:courseId/for-coupon')
  findCourseForCoupon(
    @Param('company', CompanyValidationPipe) company: string,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query() dto: FindCourseForCouponDto,
  ) {
    const companyId = companyNameToId(company);
    return this.coursesService.findCourseForCoupon(companyId, courseId, dto);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.coursesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
  //   return this.coursesService.update(+id, updateCourseDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.coursesService.remove(+id);
  // }
}
