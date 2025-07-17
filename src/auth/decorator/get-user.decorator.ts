import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { JwtValidate } from '../interfaces/jwt-payload.interfaces';

export const GetUser = createParamDecorator<
  keyof JwtValidate | (keyof JwtValidate)[] | undefined
>((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user as JwtValidate;

  if (!user) {
    return undefined;
  }

  if (!data) {
    return user;
  }
  if (Array.isArray(data)) {
    return data.reduce<Partial<JwtValidate>>((acc, key) => {
      if (user[key] !== undefined) {
        (acc[key] as JwtValidate[keyof JwtValidate]) = user[key];
      }
      return acc;
    }, {} as Partial<JwtValidate>);
  }
  return user[data];
});
