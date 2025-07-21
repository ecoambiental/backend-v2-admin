import { Controller, Get, Param, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { InstitutionValidationPipe } from 'src/common/pipes/institution-validation.pipe';
import { companyNameToId } from '../../common/utils/company-name-to-id';
import { FindCoursesForCouponDto } from './dto/fin-courses-for-coupon.dto';

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
    @Param('company', InstitutionValidationPipe) company: string,
    @Query() dto: FindCoursesForCouponDto,
  ) {
    const companyId = companyNameToId(company);
    return this.coursesService.findCoursesForCoupon(companyId, dto);
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
