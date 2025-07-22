import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Certificate, Coupon, Course } from 'ingepro-entities';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  In,
  Like,
  Not,
  Repository,
} from 'typeorm';
import { CreateCouponDto, UpdateCouponDto } from './dto';
import { FindCouponsDto } from './dto/find-coupons.dto';
import { CertificateType } from 'ingepro-entities/dist/entities/enum/certificate.enum';
import {
  CouponDisplay,
  CouponType,
} from 'ingepro-entities/dist/entities/enum/coupon.enum';
import { GetUserSelection } from 'src/auth/interfaces/jwt-payload.interfaces';
import { finalize } from 'rxjs';
@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    private dataSource: DataSource,
  ) {}

  async create(
    tokenData: GetUserSelection<
      'companyId' | 'userName' | 'userSurnames' | 'userId'
    >,
    dto: CreateCouponDto,
  ) {
    const { companyId, userId, userName, userSurnames } = tokenData;
    const normalizedDto: CreateCouponDto = {
      ...dto,
      cupon_codigo: dto.cupon_codigo.trim().toUpperCase(),
      cupon_descripcion: dto.cupon_descripcion.trim(),
    };
    const {
      cupon_tipo,
      servicio_id = 0,
      cupon_codigo,
      cupon_fecha_limite,
      cupon_visualizacion,
      cupon_monto_minimo_soles,
      cupon_monto_maximo_soles,
      cupon_monto_minimo_dolares,
      cupon_monto_maximo_dolares,
    } = normalizedDto;
    await this.ensureServiceExists(companyId, cupon_tipo, servicio_id);
    const existing = await this.couponRepository.findOne({
      where: {
        cupon_codigo: cupon_codigo,
        company: { institucion_id: tokenData.companyId },
      },
    });
    if (existing) {
      throw new ConflictException('Ya existe un cupón con ese código.');
    }
    const defaultMonto = (valor: number | undefined) => valor ?? 1;
    const isGeneral = cupon_tipo === CouponType.General;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newCoupon = this.couponRepository.create({
        ...normalizedDto,
        cupon_capacidad_estudiantes: 0,
        cupon_creador_usuario: `${userName.trim()} ${userSurnames.trim()}`,
        cupon_fecha_creacion: new Date(),
        cupon_fecha_limite: new Date(cupon_fecha_limite),
        cupon_visualizacion:
          cupon_tipo === CouponType.Certificado
            ? cupon_visualizacion
            : CouponDisplay.Inactivo,
        servicio_id,
        company: { institucion_id: companyId },
        cupon_monto_minimo_soles: isGeneral
          ? defaultMonto(cupon_monto_minimo_soles)
          : 1,
        cupon_monto_maximo_soles: isGeneral
          ? defaultMonto(cupon_monto_maximo_soles)
          : 1,
        cupon_monto_minimo_dolares: isGeneral
          ? defaultMonto(cupon_monto_minimo_dolares)
          : 1,
        cupon_monto_maximo_dolares: isGeneral
          ? defaultMonto(cupon_monto_maximo_dolares)
          : 1,
        user: { usuario_id: userId },
      });
      const savedCoupon = await queryRunner.manager.save(newCoupon);
      if (
        cupon_tipo === CouponType.Certificado &&
        cupon_visualizacion === CouponDisplay.Activo
      ) {
        await queryRunner.manager.update(
          Coupon,
          {
            company: { institucion_id: companyId },
            cupon_tipo: CouponType.Certificado,
            servicio_id,
            cupon_visualizacion: CouponDisplay.Activo,
            cupon_id: Not(savedCoupon.cupon_id),
          },
          {
            cupon_visualizacion: CouponDisplay.Inactivo,
          },
        );
      }
      await queryRunner.commitTransaction();
      return savedCoupon;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al guardar el cupón:', error);
      throw new InternalServerErrorException('No se pudo guardar el cupón.');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    companyId: number,
    { search, state, type, limit, page, downloadAll }: FindCouponsDto,
  ) {
    const baseFilters = {
      ...(state !== undefined && { cupon_estado: state }),
      ...(type !== undefined && { cupon_tipo: type }),
      company: { institucion_id: companyId },
    };

    const where: FindOptionsWhere<Coupon>[] = search
      ? [
          { ...baseFilters, cupon_codigo: Like(`%${search}%`) },
          { ...baseFilters, cupon_descripcion: Like(`%${search}%`) },
        ]
      : [baseFilters];
    if (downloadAll) {
      const [coupons, total] = await this.couponRepository.findAndCount({
        where,
        order: { cupon_id: 'DESC' },
      });

      return { total, coupons };
    }

    const [coupons, total] = await this.couponRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { cupon_id: 'DESC' },
    });

    const courseIds = coupons
      .filter((coupon) => coupon.cupon_tipo === CouponType.Curso)
      .map((c) => c.servicio_id);
    const certificateIds = coupons
      .filter((coupon) => coupon.cupon_tipo === CouponType.Certificado)
      .map((c) => c.servicio_id);

    const [courses, certificates] = await Promise.all([
      courseIds.length > 0
        ? this.findCoursesByIds(companyId, courseIds)
        : Promise.resolve([] as Course[]),
      certificateIds.length > 0
        ? this.findCourseCertificatesByIds(companyId, certificateIds)
        : Promise.resolve([] as Certificate[]),
    ]);
    const courseMap = courses.length
      ? new Map(courses.map((course) => [course.curso_id, course]))
      : new Map();

    const certificateMap = certificates.length
      ? new Map(
          certificates.map((certificate) => [
            certificate.certificado_id,
            certificate,
          ]),
        )
      : new Map();
    const enrichedCoupons = coupons.map((coupon) => {
      if (coupon.cupon_tipo === CouponType.Curso && courseMap.size > 0) {
        return {
          ...coupon,
          course: courseMap.get(coupon.servicio_id) || null,
        };
      } else if (
        coupon.cupon_tipo === CouponType.Certificado &&
        certificateMap.size > 0
      ) {
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
      const courses = await this.findCoursesByIds(companyId, [
        coupon.servicio_id,
      ]);
      const course = courses[0] || null;
      return { ...coupon, curso: course };
    } else if (coupon.cupon_tipo === CouponType.Certificado) {
      const certificates = await this.findCourseCertificatesByIds(companyId, [
        coupon.servicio_id,
      ]);
      const certificate = certificates[0] || null;
      return { ...coupon, certificado: certificate };
    } else {
      return coupon;
    }
  }

  async update(
    companyId: number,
    couponId: number,
    updateCouponDto: UpdateCouponDto,
  ) {
    const existingCoupon = await this.couponRepository.findOne({
      where: {
        cupon_id: couponId,
        company: { institucion_id: companyId },
      },
    });
    if (!existingCoupon) {
      throw new NotFoundException('Cupón no encontrado');
    }
    if (
      updateCouponDto.cupon_codigo !== undefined &&
      updateCouponDto.cupon_codigo !== existingCoupon.cupon_codigo
    ) {
      const duplicate = await this.couponRepository.findOne({
        where: {
          cupon_codigo: updateCouponDto.cupon_codigo,
          company: { institucion_id: companyId },
          cupon_id: Not(couponId), // excluye el cupón actual
        },
      });
      if (duplicate) {
        throw new ConflictException('Código en uso.');
      }
    }
    const tipoNuevo = updateCouponDto.cupon_tipo ?? existingCoupon.cupon_tipo;
    const servicioNuevo =
      updateCouponDto.servicio_id ?? existingCoupon.servicio_id;

    const tipoCambiado = updateCouponDto.cupon_tipo !== undefined;
    const servicioCambiado = updateCouponDto.servicio_id !== undefined;

    if (updateCouponDto.cupon_tipo === CouponType.General) {
      updateCouponDto.servicio_id = 0;
    }
    if (
      (tipoCambiado || servicioCambiado) &&
      tipoNuevo !== CouponType.General
    ) {
      await this.ensureServiceExists(companyId, tipoNuevo, servicioNuevo);
    }
    if (updateCouponDto.cupon_monto_porcentaje !== undefined) {
      updateCouponDto.cupon_monto_porcentaje =
        Math.round(updateCouponDto.cupon_monto_porcentaje * 100) / 100;
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const updatedCoupon = await queryRunner.manager.save(
        this.couponRepository.create({
          ...existingCoupon,
          ...updateCouponDto,
        }),
      );
      if (
        updatedCoupon.cupon_tipo === CouponType.Certificado &&
        updatedCoupon.cupon_visualizacion === CouponDisplay.Activo
      ) {
        await queryRunner.manager.update(
          Coupon,
          {
            company: { institucion_id: companyId },
            cupon_tipo: CouponType.Certificado,
            servicio_id: updatedCoupon.servicio_id,
            cupon_visualizacion: CouponDisplay.Activo,
            cupon_id: Not(updatedCoupon.cupon_id),
          },
          {
            cupon_visualizacion: CouponDisplay.Inactivo,
          },
        );
      }
      await queryRunner.commitTransaction();
      return updatedCoupon;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al actualizar el cupón:', error);
      throw new InternalServerErrorException('No se pudo actualizar el cupón.');
    } finally {
      await queryRunner.release();
    }
  }

  remove(id: number) {
    return `This action removes a #${id} coupon`;
  }

  // TODO: Implementar lógica para certificados de especialización cuando se habilite su venta.
  // Actualmente solo se soportan certificados de tipo curso.
  private async ensureServiceExists(
    companyId: number,
    tipo: CouponType,
    servicioId: number,
  ) {
    if (tipo === CouponType.General) {
      return;
    }
    if (!servicioId) {
      throw new BadRequestException('Debe especificar un ID de servicio');
    }
    if (tipo === CouponType.Curso) {
      const course = await this.findCourse(companyId, servicioId);
      if (!course)
        throw new NotFoundException('El curso especificado no existe');
    } else if (tipo === CouponType.Certificado) {
      const certificate = await this.findCertificate(companyId, servicioId);
      if (!certificate)
        throw new NotFoundException('El certificado especificado no existe');
    } else {
      throw new BadRequestException('Tipo de servicio no válido');
    }
  }

  private async findCourse(companyId: number, courseId: number) {
    return await this.courseRepository.findOneBy({
      curso_id: courseId,
      company: { institucion_id: companyId },
    });
  }

  // TODO: Implementar lógica para certificados de especialización cuando se habilite su venta.
  // Actualmente solo se soportan certificados de tipo curso.
  private async findCertificate(companyId: number, certificateId: number) {
    return await this.certificateRepository.findOneBy({
      certificado_id: certificateId,
      tipo_servicio: CertificateType.Curso,
      company: { institucion_id: companyId },
    });
  }

  private async findCoursesByIds(companyId: number, courseIds: number[]) {
    return await this.courseRepository.find({
      select: {
        curso_id: true,
        curso_nombre: true,
        curso_fecha_inicio: true,
        // curso_imagen: true,
        // curso_portada: true,
        curso_precio_soles: true,
        curso_precio_dolar: true,
      },
      where: {
        curso_id: In(courseIds),
        company: { institucion_id: companyId },
      },
    });
  }

  // TODO: Implementar lógica para certificados de especialización cuando se habilite su venta.
  // Actualmente solo se soportan certificados de tipo curso.
  private async findCourseCertificatesByIds(
    companyId: number,
    certificateIds: number[],
  ) {
    return await this.certificateRepository.find({
      select: {
        certificado_id: true,
        certificado_costo_dolares: true,
        certificado_costo_soles: true,
        typeCertificate: {
          tipocert_nombre: true,
          // tipocert_logo: true,
        },
        course: {
          curso_id: true,
          curso_nombre: true,
          curso_fecha_inicio: true,
          // curso_imagen: true,
          // curso_portada: true,
        },
      },
      where: {
        certificado_id: In(certificateIds),
        tipo_servicio: CertificateType.Curso,
        company: { institucion_id: companyId },
      },
      relations: ['typeCertificate', 'course'],
    });
  }

  async deactivateOtherActiveCouponsForCertificate(
    institucion_id: number,
    servicio_id: number,
    excludeCouponId?: number,
  ) {
    try {
      const whereClause: FindOptionsWhere<Coupon> = {
        company: { institucion_id },
        cupon_tipo: CouponType.Certificado,
        servicio_id,
        cupon_visualizacion: CouponDisplay.Activo,
      };

      if (excludeCouponId !== undefined) {
        whereClause.cupon_id = Not(excludeCouponId);
      }

      const otrosActivos = await this.couponRepository.update(whereClause, {
        cupon_visualizacion: CouponDisplay.Inactivo,
      });
      return otrosActivos;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
