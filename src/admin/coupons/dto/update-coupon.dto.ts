import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import {
  CouponDisplay,
  CouponState,
  CouponType,
} from 'ingepro-entities/dist/entities/enum/coupon.enum';

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  cupon_codigo?: string;

  @IsOptional()
  @IsString()
  cupon_descripcion?: string;

  @IsOptional()
  @IsDateString()
  cupon_fecha_limite?: string;

  @IsOptional()
  @IsNumber()
  cupon_tiempo_duracion?: number;

  @IsOptional()
  @IsNumber()
  cupon_estudiante_maxima?: number;

  @IsOptional()
  @IsNumber()
  cupon_monto_porcentaje?: number;

  @IsOptional()
  @IsEnum(CouponState)
  cupon_estado?: CouponState;

  @IsOptional()
  @IsEnum(CouponType)
  cupon_tipo?: CouponType;

  @IsNumber()
  @ValidateIf(
    (o) =>
      o.cupon_tipo === CouponType.Curso ||
      o.cupon_tipo === CouponType.Certificado,
  )
  @IsNotEmpty({
    message: 'servicio_id es obligatorio cuando el tipo es Curso o Certificado',
  })
  servicio_id?: number;

  @IsOptional()
  @IsNumber()
  cupon_monto_minimo_soles?: number;

  @IsOptional()
  @IsNumber()
  cupon_monto_minimo_dolares?: number;

  @IsOptional()
  @IsNumber()
  cupon_monto_maximo_soles?: number;

  @IsOptional()
  @IsNumber()
  cupon_monto_maximo_dolares?: number;

  @IsOptional()
  @IsEnum(CouponDisplay)
  @ValidateIf((o) => o.cupon_tipo === CouponType.Certificado)
  cupon_visualizacion?: CouponDisplay;
}
