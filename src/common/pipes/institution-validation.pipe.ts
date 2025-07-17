import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { companyNameToId } from '../utils';
import { ALLOWED_INSTITUTIONS } from '../constants/institution';

@Injectable()
export class InstitucionValidationPipe implements PipeTransform {
  transform(value: string): string {
    const normalized = value.trim().toLowerCase();
    if (!ALLOWED_INSTITUTIONS.includes(normalized)) {
      throw new BadRequestException(
        `Institución inválida. Valores permitidos: ${ALLOWED_INSTITUTIONS.join(', ')}`,
      );
    }
    return normalized;
  }
}
