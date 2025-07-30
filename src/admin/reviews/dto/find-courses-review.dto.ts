import { IsOptional, IsString } from 'class-validator';
import {
  CourseModality,
  CourseState,
  CourseType,
} from 'ingepro-entities/dist/entities/enum/course.enum';
import { PaginatorDto } from 'src/common/dto';

export class FindCoursesReviewDto extends PaginatorDto {
  @IsOptional()
  @IsString()
  courseState?: CourseState;

  @IsOptional()
  @IsString()
  courseType?: CourseType;

  @IsOptional()
  @IsString()
  courseModality?: CourseModality;
}
