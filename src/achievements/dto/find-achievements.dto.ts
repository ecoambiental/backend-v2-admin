import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { PaginatorDto } from 'src/common/dto';

export class FindAchievementsDto {
  @IsOptional()
  @IsIn(['Docente', 'Tutor'])
  userType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entityId?: number;
}
