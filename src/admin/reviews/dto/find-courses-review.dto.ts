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
  state?: CourseState;

  @IsOptional()
  @IsString()
  type?: CourseType;

  @IsOptional()
  @IsString()
  modality?: CourseModality;
}
