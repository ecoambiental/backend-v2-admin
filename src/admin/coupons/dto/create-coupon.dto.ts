import { IsEnum, IsNumber, IsString, ValidateIf } from 'class-validator';
import {
  CouponDisplay,
  CouponType,
} from 'ingepro-entities/dist/entities/enum/coupon.enum';

export class CreateCouponDto {
  @ValidateIf((o) => o.cupon_tipo === CouponType.Certificado)
  @IsEnum(CouponDisplay)
  cupon_visualizacion: CouponDisplay;

  @IsEnum(CouponType)
  cupon_tipo: CouponType;

  @IsNumber()
  cupon_estudiante_maxima: number;

  @IsNumber()
  cupon_monto_maximo_dolares: number;

  @IsNumber()
  cupon_monto_maximo_soles: number;

  @IsNumber()
  cupon_monto_minimo_dolares: number;

  @IsNumber()
  cupon_monto_minimo_soles: number;

  @IsNumber()
  cupon_monto_porcentaje: number;

  @IsNumber()
  cupon_tiempo_duracion: number;

  @IsNumber()
  servicio_id: number;

  @IsString()
  cupon_codigo: string;

  @IsString()
  cupon_descripcion: string;

  @IsString()
  cupon_fecha_limite: string;
}
