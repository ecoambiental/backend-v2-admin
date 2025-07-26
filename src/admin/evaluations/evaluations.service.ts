import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evaluation, EvaluationAttempt } from 'ingepro-entities';
import { Repository } from 'typeorm';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(EvaluationAttempt)
    private evaluationAttemptRepository: Repository<EvaluationAttempt>,
  ) {}

  async findOne(companyId: number, evaluationAttemptId: number) {
    const evaluationAttempt = await this.evaluationAttemptRepository.findOne({
      relations: {
        student: {
          user: true,
        },
        evaluation: true,
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
        student: {
          estudiante_id: true,
          user: {
            usuario_id: true,
            usuario_nombres: true,
            usuario_apellidos: true,
          },
        },
        evaluation: {
          evaluacion_id: true,
          evaluacion_descripcion: true,
        },
        evaluationAttemptDetail: {
          detalle_evaluacion_respuesta_correcta: true,
          detalle_evaluacion_respuesta_elegida: true,
          detalle_evaluacion_estado: true,
          detalle_evaluacion_puntuacion: true,
          question: true,
        },
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
