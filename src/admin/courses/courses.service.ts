import { Injectable, NotFoundException } from '@nestjs/common';
import { FindCoursesForCouponDto } from './dto/find-courses-for-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'ingepro-entities';
import { FindOptionsRelations, Like, Repository } from 'typeorm';
import { courseSelects } from './select/course.select';
import {
  CourseState,
  CourseType,
} from 'ingepro-entities/dist/entities/enum/course.enum';
import {
  CertificateState,
  CertificateType,
} from 'ingepro-entities/dist/entities/enum/certificate.enum';
import { FindCourseForCouponDto } from './dto/find-course-for-coupon.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
  ) {}

  // create(createCourseDto: CreateCourseDto) {
  //   return 'This action adds a new course';
  // }

  // async findAll() {
  //   return `This action returns all courses`;
  // }

  async findCoursesForCoupon(
    companyId: number,
    { isForCertificates, limit, page, search }: FindCoursesForCouponDto,
  ) {
    const relations: FindOptionsRelations<Course> = isForCertificates
      ? {
          certificates: {
            typeCertificate: true,
          },
        }
      : {};
    const courses = await this.courseRepository.find({
      relations,
      select: courseSelects.forCoupon(),
      where: {
        ...(isForCertificates
          ? {
              certificates: {
                certificado_estado: CertificateState.Activo,
                tipo_servicio: CertificateType.Curso,
              },
            }
          : { curso_tipo: CourseType.Pagado }),
        ...(search ? { curso_nombre: Like(`%${search}%`) } : {}),
        curso_estado: CourseState.Activo,
        company: { institucion_id: companyId },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { curso_id: 'DESC' },
    });
    return courses;
  }

  async findCourseForCoupon(
    companyId: number,
    courseId: number,
    { isForCertificates }: FindCourseForCouponDto,
  ) {
    const relations: FindOptionsRelations<Course> = isForCertificates
      ? {
          certificates: {
            typeCertificate: true,
          },
        }
      : {};
    const course = await this.courseRepository.findOne({
      relations,
      select: courseSelects.forCoupon(),
      where: {
        ...(isForCertificates
          ? {
              certificates: {
                certificado_estado: CertificateState.Activo,
                tipo_servicio: CertificateType.Curso,
              },
            }
          : { curso_tipo: CourseType.Pagado }),
        curso_estado: CourseState.Activo,
        curso_id: courseId,
        company: { institucion_id: companyId },
      },
    });
    if (!course) {
      throw new NotFoundException(
        'Curso no encontrado o no pertenece a la empresa.',
      );
    }
    return course;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} course`;
  // }

  // update(id: number, updateCourseDto: UpdateCourseDto) {
  //   return `This action updates a #${id} course`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} course`;
  // }
}
