import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evaluation, EvaluationAttemptDetail } from 'ingepro-entities';
import { Repository } from 'typeorm';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private evaluationRepository: Repository<Evaluation>,
    @InjectRepository(EvaluationAttemptDetail)
    private evaluationAttemptDetailRepository: Repository<EvaluationAttemptDetail>,
  ) {}

  async findEvaluationAttemptsByStudent(
    companyId: number,
    evaluationId: number,
    studentId: number,
  ) {
    const evaluation = await this.evaluationRepository
      .createQueryBuilder('evaluation')
      .leftJoinAndSelect('evaluation.evaluationAttempt', 'attempt')
      .leftJoinAndSelect('attempt.student', 'student')
      .leftJoin('student.company', 'company')
      .where('evaluation.evaluacion_id = :evaluationId', { evaluationId })
      .andWhere('student.estudiante_id = :studentId', { studentId })
      .andWhere('company.institucion_id = :companyId', { companyId })
      .getOne();
    const counts = await this.evaluationAttemptDetailRepository
      .createQueryBuilder('detail')
      .select('detail.entrega_evaluacion_id', 'attemptId')
      .addSelect('COUNT(*)', 'count')
      .where('detail.detalle_evaluacion_estado = 1')
      .andWhere('detail.entrega_evaluacion_id IN (:...ids)', {
        ids: evaluation.evaluationAttempt.map((a) => a.entrega_evaluacion_id),
      })
      .groupBy('detail.entrega_evaluacion_id')
      .getRawMany();
    const countMap = new Map(counts.map((c) => [c.attemptId, Number(c.count)]));
    evaluation.evaluationAttempt.forEach((attempt) => {
      (attempt as any).evaluationAttemptDetailCount =
        countMap.get(attempt.entrega_evaluacion_id) || 0;
    });
    if (!evaluation)
      throw new NotFoundException(
        `No se encontraron intentos de evaluación para el estudiante con ID ${studentId} en la evaluación ${evaluationId} dentro de la institución ${companyId}.`,
      );
    return evaluation;
  }
}
