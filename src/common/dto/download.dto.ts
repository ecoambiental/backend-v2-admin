import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class DownloadDto {
  @IsOptional()
  @Transform(({ value }) => ['true', '1', 1, true].includes(value))
  downloadAll?: boolean = false;
}
