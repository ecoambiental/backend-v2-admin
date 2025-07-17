import { Injectable, NotFoundException } from '@nestjs/common';
import { Certificate, Coupon, Course } from 'ingepro-entities';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateCouponDto, UpdateCouponDto } from './dto';
import { FindCouponsDto } from './dto/find-coupons.dto';
import { CertificateType } from 'ingepro-entities/dist/entities/enum/certificate.enum';
import { CouponType } from 'ingepro-entities/dist/entities/enum/coupon.enum';
@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(Course) private courseRepository: Repository<Course>,
  ) {}

  create(createCouponDto: CreateCouponDto) {
    return 'This action adds a new coupon';
  }

  async findAll(
    companyId: number,
    { state, type, limit, page, downloadAll }: FindCouponsDto,
  ) {
    const where: FindOptionsWhere<Coupon> = {
      ...(state !== undefined && { cupon_estado: state }),
      ...(type !== undefined && { cupon_tipo: type }),
      company: { institucion_id: companyId },
    };
    if (downloadAll) {
      const [coupons, total] = await this.couponRepository.findAndCount({
        where,
      });

      return { total, coupons };
    }
    const [coupons, total] = await this.couponRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
    const courseIds = coupons
      .filter((coupon) => coupon.cupon_tipo === CouponType.Curso)
      .map((c) => c.servicio_id);
    const certificateIds = coupons
      .filter((coupon) => coupon.cupon_tipo === CouponType.Certificado)
      .map((c) => c.servicio_id);
    const courses = await this.findCoursesByIds(courseIds);
    const certificates = await this.findCourseCertificatesByIds(certificateIds);
    const courseMap = new Map(
      courses.map((course) => [course.curso_id, course]),
    );
    const certificateMap = new Map(
      certificates.map((certificate) => [
        certificate.certificado_id,
        certificate,
      ]),
    );
    const enrichedCoupons = coupons.map((coupon) => {
      if (coupon.cupon_tipo === CouponType.Curso) {
        return {
          ...coupon,
          course: courseMap.get(coupon.servicio_id) || null,
        };
      } else if (coupon.cupon_tipo === CouponType.Certificado) {
        return {
          ...coupon,
          certificate: certificateMap.get(coupon.servicio_id) || null,
        };
      } else {
        return { ...coupon };
      }
    });

    return { total, coupons: enrichedCoupons };
  }

  private async findCoursesByIds(courseIds: number[]) {
    return await this.courseRepository.find({
      select: {
        curso_id: true,
        curso_nombre: true,
        curso_fecha_inicio: true,
        curso_imagen: true,
        curso_portada: true,
        curso_precio_soles: true,
        curso_precio_dolar: true,
      },
      where: { curso_id: In(courseIds) },
    });
  }

  // TODO: Implementar lógica para certificados de especialización cuando se habilite su venta.
  // Actualmente solo se soportan certificados de tipo curso.
  private async findCourseCertificatesByIds(certificateIds: number[]) {
    return await this.certificateRepository.find({
      select: {
        certificado_id: true,
        certificado_costo_dolares: true,
        certificado_costo_soles: true,
        typeCertificate: {
          tipocert_nombre: true,
          tipocert_logo: true,
        },
        course: {
          curso_id: true,
          curso_nombre: true,
          curso_fecha_inicio: true,
          curso_imagen: true,
          curso_portada: true,
        },
      },
      where: {
        certificado_id: In(certificateIds),
        tipo_servicio: CertificateType.Curso,
      },
      relations: ['typeCertificate', 'course'],
    });
  }

  async findOne(companyId: number, id: number) {
    const coupon = await this.couponRepository.findOne({
      where: {
        cupon_id: id,
        company: { institucion_id: companyId },
      },
    });
    if (!coupon) {
      throw new NotFoundException(
        `Cupón con ID ${id} no encontrado para la institución ${companyId}`,
      );
    }
    if (coupon.cupon_tipo === CouponType.Curso) {
      const courses = await this.findCoursesByIds([coupon.servicio_id]);
      const course = courses[0] || null;
      return { ...coupon, curso: course };
    } else if (coupon.cupon_tipo === CouponType.Certificado) {
      const certificates = await this.findCourseCertificatesByIds([
        coupon.servicio_id,
      ]);
      const certificate = certificates[0] || null;
      return { ...coupon, certificado: certificate };
    } else {
      return coupon;
    }
  }

  update(id: number, updateCouponDto: UpdateCouponDto) {
    return `This action updates a #${id} coupon`;
  }

  remove(id: number) {
    return `This action removes a #${id} coupon`;
  }
}
