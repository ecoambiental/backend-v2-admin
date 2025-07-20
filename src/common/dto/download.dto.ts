import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class DownloadDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  downloadAll?: boolean = false;
}
