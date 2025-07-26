import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluationAttempt } from 'ingepro-entities';
import { Repository } from 'typeorm';

@Injectable()
export class EvaluationAttemptsService {
  constructor(
    @InjectRepository(EvaluationAttempt)
    private evaluationAttemptRepository: Repository<EvaluationAttempt>,
  ) {}

  async findOne(companyId: number, evaluationAttemptId: number) {
    const evaluationAttempt = await this.evaluationAttemptRepository.findOne({
      relations: {
        evaluationAttemptDetail: {
          question: {
            alternative: true,
          },
        },
      },
      select: {
        entrega_evaluacion_id: true,
        envio_nota: true,
        envio_estado: true,
        envio_hora_inicio: true,
        envio_hora_fin: true,
        envio_hora_envio: true,
      },
      where: {
        entrega_evaluacion_id: evaluationAttemptId,
        student: { company: { institucion_id: companyId } },
      },
    });
    if (!evaluationAttempt) {
      throw new NotFoundException(
        `Intento con ID ${evaluationAttemptId} no encontrado para la institución ${companyId}`,
      );
    }
    return evaluationAttempt;
  }
}
