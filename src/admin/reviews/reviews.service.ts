import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course, Enrollment } from 'ingepro-entities';
import { IsNull, Not, Repository } from 'typeorm';
import { FindCoursesReviewDto } from './dto';
import * as ExcelJs from 'exceljs';
import { FindCourseReviewDto } from './dto/find-course-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async findCoursesReview(
    companyId: number,
    dto: FindCoursesReviewDto,
    downloadAll = false,
  ) {
    const { limit, modality, page, search, state, type } = dto;
    const baseQuery = this.courseRepository
      .createQueryBuilder('c')
      .select('c.curso_id', 'curso_id')
      .addSelect('c.curso_nombre', 'curso_nombre')
      .addSelect('c.curso_fecha_inicio', 'curso_fecha_inicio')
      .where('c.company.institucion_id = :companyId', { companyId });
    if (modality)
      baseQuery.andWhere('c.curso_modalidad = :modality', {
        modality,
      });
    if (state)
      baseQuery.andWhere('c.curso_estado = :state', {
        state,
      });
    if (type)
      baseQuery.andWhere('c.curso_tipo = :type', {
        type,
      });
    if (search) {
      baseQuery.andWhere(
        '(c.curso_nombre LIKE :search OR c.curso_descripcion LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }
    const courses = await baseQuery
      .leftJoin('c.enrollment', 'e')
      .addSelect(
        'ROUND(AVG(e.matricula_valoracion_curso), 2)',
        'promedio_valoracion',
      )
      .addSelect(
        'COUNT(CASE WHEN e.matricula_valoracion_curso = 5 THEN 1 END)',
        'cantidad_5',
      )
      .addSelect(
        'COUNT(CASE WHEN e.matricula_valoracion_curso = 4 THEN 1 END)',
        'cantidad_4',
      )
      .addSelect(
        'COUNT(CASE WHEN e.matricula_valoracion_curso = 3 THEN 1 END)',
        'cantidad_3',
      )
      .addSelect(
        'COUNT(CASE WHEN e.matricula_valoracion_curso = 2 THEN 1 END)',
        'cantidad_2',
      )
      .addSelect(
        'COUNT(CASE WHEN e.matricula_valoracion_curso = 1 THEN 1 END)',
        'cantidad_1',
      )
      .groupBy('c.curso_id')
      .offset(!downloadAll ? (page - 1) * limit : undefined)
      .limit(!downloadAll ? limit : undefined)
      .orderBy('c.curso_id', 'DESC')
      .getRawMany();
    if (downloadAll) {
      return this.excel(courses);
    }
    const total = await baseQuery.getCount();

    return { total, courses };
  }

  async findCourseSummary(companyId: number, courseId: number) {
    const course = await this.courseRepository
      .createQueryBuilder('c')
      .select('c.curso_id', 'curso_id')
      .addSelect('c.curso_nombre', 'curso_nombre')
      .addSelect('c.curso_fecha_inicio', 'curso_fecha_inicio')
      .leftJoin('c.enrollment', 'e')
      .where('c.company.institucion_id = :companyId', { companyId })
      .andWhere('c.curso_id = :courseId', { courseId })
      .addSelect(
        'ROUND(AVG(e.matricula_valoracion_curso), 2)',
        'promedio_valoracion',
      )
      .addSelect(
        'COUNT(CASE WHEN e.matricula_valoracion_curso = 5 THEN 1 END)',
        'cantidad_5',
      )
      .addSelect(
        'COUNT(CASE WHEN e.matricula_valoracion_curso = 4 THEN 1 END)',
        'cantidad_4',
      )
      .addSelect(
        'COUNT(CASE WHEN e.matricula_valoracion_curso = 3 THEN 1 END)',
        'cantidad_3',
      )
      .addSelect(
        'COUNT(CASE WHEN e.matricula_valoracion_curso = 2 THEN 1 END)',
        'cantidad_2',
      )
      .addSelect(
        'COUNT(CASE WHEN e.matricula_valoracion_curso = 1 THEN 1 END)',
        'cantidad_1',
      )
      .groupBy('c.curso_id')
      .orderBy('c.curso_id', 'DESC')
      .getRawOne();
    if (!course) {
      throw new NotFoundException(
        `Curso con ID ${courseId} no encontrado para la institución ${companyId}`,
      );
    }
    return course;
  }

  async findCourseReviews(
    companyId: number,
    courseId: number,
    { limit, page }: FindCourseReviewDto,
    downloadAll = false,
  ) {
    const [reviews, total] = await this.enrollmentRepository.findAndCount({
      relations: { student: { user: true } },
      select: {
        matricula_id: true,
        matricula_valoracion_comentario: true,
        matricula_valoracion_curso: true,
        matricula_valoracion_docente: true,
        matricula_valoracion_tutor: true,
        student: {
          estudiante_id: true,
          user: {
            usuario_id: true,
            usuario_apellidos: true,
            usuario_correo: true,
            usuario_telefono: true,
            usuario_nombres: true,
            usuario_carnet_identidad: true,
          },
        },
      },
      where: {
        matricula_valoracion_curso: Not(IsNull()),
        course: {
          curso_id: courseId,
          company: { institucion_id: companyId },
        },
      },
      ...(downloadAll ? {} : { skip: (page - 1) * limit, take: limit }),
    });
    return { total, reviews };
  }

  private async excel(data: any[]) {
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reseñas de Cursos');
    const columns: Partial<ExcelJs.Column>[] = [
      { header: 'ID', key: 'curso_id', width: 10 },
      { header: 'Nombre del Curso', key: 'curso_nombre', width: 10 },
      { header: 'Fecha inicio', key: 'curso_fecha_inicio', width: 10 },
      { header: 'Promedio Valoración', key: 'promedio_valoracion', width: 10 },
      { header: '5 estrellas', key: 'cantidad_5', width: 10 },
      { header: '4 estrellas', key: 'cantidad_4', width: 10 },
      { header: '3 estrellas', key: 'cantidad_3', width: 10 },
      { header: '2 estrellas', key: 'cantidad_2', width: 10 },
      { header: '1 estrella', key: 'cantidad_1', width: 10 },
    ];
    worksheet.addTable({
      name: 'TablaReseñas',
      ref: 'A1',
      headerRow: true,
      style: {
        theme: 'TableStyleLight8',
        showRowStripes: true,
      },
      columns: columns.map((col) => ({
        name: col.header as string,
        filterButton: true,
      })),
      rows: data.map((item) => [
        item.curso_id,
        item.curso_nombre,
        item.curso_fecha_inicio,
        Number(item.promedio_valoracion),
        Number(item.cantidad_5),
        Number(item.cantidad_4),
        Number(item.cantidad_3),
        Number(item.cantidad_2),
        Number(item.cantidad_1),
      ]),
    });
    worksheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length + 2);
      });
      column.width = Math.min(maxLength, 40);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async exportCourseReviews(companyId: number, courseId: number) {
    const summary = await this.findCourseSummary(companyId, courseId);
    const { total, reviews } = await this.findCourseReviews(
      companyId,
      courseId,
      {},
      true,
    );

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet(summary.curso_nombre);
    const row = worksheet.addRow(['Resumen del Curso']);
    worksheet.mergeCells(`A${row.number}:E${row.number}`);
    row.eachCell((cell) =>
      Object.assign(cell, {
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '00000000' },
        },
        alignment: { vertical: 'middle', horizontal: 'center' },
      }),
    );

    // Estilos
    const labelStyle = { font: { bold: true } };
    const valueStyle: Partial<ExcelJs.Style> = {
      alignment: { horizontal: 'right' },
      numFmt: '#,##0',
    };
    const decimalStyle: Partial<ExcelJs.Style> = {
      alignment: { horizontal: 'right' },
      numFmt: '#,##0.00',
    };

    // Función para agregar fila con estilos
    function addStyledRow(
      label1: string,
      value1: any,
      label2: string,
      value2: any,
      isDecimal = false,
    ) {
      const row = worksheet.addRow([label1, value1, '', label2, value2]);
      row.getCell(1).style = labelStyle;
      row.getCell(2).alignment = { horizontal: 'right' };
      row.getCell(4).style = labelStyle;
      row.getCell(5).style = isDecimal ? decimalStyle : valueStyle;
    }

    function toLocalDate(utcDateStr: string): string {
      const utcDate = new Date(utcDateStr);
      const localDate = new Date(utcDate.getTime() - 5 * 60 * 60 * 1000); // UTC-5
      return localDate.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }

    // Agregar filas usando la función
    addStyledRow(
      'ID del Curso',
      summary.curso_id,
      'Promedio de Valoración',
      summary.promedio_valoracion,
      true,
    );
    addStyledRow(
      'Nombre',
      summary.curso_nombre,
      'Cantidad con 5 estrellas',
      Number(summary.cantidad_5),
    );
    addStyledRow(
      'Fecha de Inicio',
      toLocalDate(summary.curso_fecha_inicio),
      'Cantidad con 4 estrellas',
      Number(summary.cantidad_4),
    );
    addStyledRow(
      '',
      '',
      'Cantidad con 3 estrellas',
      Number(summary.cantidad_3),
    );
    addStyledRow(
      '',
      '',
      'Cantidad con 2 estrellas',
      Number(summary.cantidad_2),
    );
    addStyledRow('', '', 'Cantidad con 1 estrella', Number(summary.cantidad_1));

    // 🟨 2. Espacio entre secciones
    worksheet.addRow([]);
    const lastSpace = worksheet.addRow([]);
    const headers = [
      'Carnet Identidad',
      'Nombres y Apellidos',
      'Correo',
      'Teléfono',
      'Valoración Curso',
      'Valoración Docente',
      'Valoración Tutor',
      'Comentario',
    ];
    worksheet.addTable({
      name: 'ReseñasCurso',
      ref: `A${lastSpace.number + 1}`,
      headerRow: true,
      style: {
        theme: 'TableStyleLight8',
        showRowStripes: true,
      },
      columns: headers.map((h) => ({ name: h, filterButton: true })),
      rows: reviews.map((r) => [
        r.student.user.usuario_carnet_identidad,
        r.student.user.usuario_nombres + ' ' + r.student.user.usuario_apellidos,
        r.student.user.usuario_correo,
        r.student.user.usuario_telefono,
        r.matricula_valoracion_curso,
        r.matricula_valoracion_docente,
        r.matricula_valoracion_tutor,
        r.matricula_valoracion_comentario,
      ]),
    });

    const startDataRow = lastSpace.number + 2;
    const endDataRow = startDataRow + reviews.length - 1;
    for (let rowIndex = startDataRow; rowIndex <= endDataRow; rowIndex++) {
      ['E', 'F', 'G'].forEach((col) => {
        const cell = worksheet.getCell(`${col}${rowIndex}`);
        cell.numFmt = '#,##0';
        cell.alignment = { horizontal: 'right' };
      });
    }

    // 🧾 Auto ajuste de columnas
    worksheet.columns.forEach((col) => {
      let maxLength = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const length = cell.value?.toString().length ?? 0;
        if (length > maxLength) maxLength = length;
      });
      col.width = maxLength + 2;
    });

    // 📦 Exportar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer, courseName: summary.curso_nombre };
  }
}
