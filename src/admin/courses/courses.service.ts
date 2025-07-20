import { Injectable } from '@nestjs/common';
import { FindCoursesForCouponDto } from './dto/fin-courses-for-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'ingepro-entities';
import { FindOptionsRelations, Like, Repository } from 'typeorm';
import { courseSelects } from './select/course.select';
import {
  CourseState,
  CourseType,
} from 'ingepro-entities/dist/entities/enum/course.enum';

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
      where: [
        {
          ...(isForCertificates ? {} : { curso_tipo: CourseType.Pagado }),
          ...(search ? { curso_nombre: Like(`%${search}%`) } : {}),
          curso_estado: CourseState.Activo,
          company: { institucion_id: companyId },
        },
        {
          ...(isForCertificates ? {} : { curso_tipo: CourseType.Pagado }),
          ...(search ? { curso_descripcion: Like(`%${search}%`) } : {}),
          curso_estado: CourseState.Activo,
          company: { institucion_id: companyId },
        },
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { curso_id: 'DESC' },
    });
    return courses;
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
