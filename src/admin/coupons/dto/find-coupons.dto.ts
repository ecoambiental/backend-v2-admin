import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  CouponState,
  CouponType,
} from 'ingepro-entities/dist/entities/enum/coupon.enum';

export class FindCouponsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsEnum(CouponState)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Estado del cupón: 0 = Inactivo, 1 = Activo',
  })
  state?: CouponState;

  @IsEnum(CouponType)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Tipo de cupón: General, Curso o Certificado',
  })
  type?: CouponType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Número de página para paginación (empieza en 1)',
  })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Cantidad de registros por página para paginación',
  })
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  downloadAll?: boolean = false;
}
