// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Rol } from 'ingepro-entities/dist/entities/enum/user.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
