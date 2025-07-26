// src/guards/same-company.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { companyNameToId } from '../utils';

@Injectable()
export class SameCompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userCompanyId = request.user.companyId;
    const paramCompanyId = companyNameToId(request.params.company);
    if (!userCompanyId) {
      throw new UnauthorizedException('Token inválido o sin companyId');
    }

    if (!paramCompanyId) {
      throw new ForbiddenException('Institución no proporcionada en ruta');
    }
    console.log(userCompanyId, paramCompanyId);
    if (userCompanyId !== paramCompanyId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a esta institución',
      );
    }

    return true;
  }
}
