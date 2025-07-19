import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrator, Teacher, Tutor, User } from 'ingepro-entities';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, JwtModule],
  imports: [
    TypeOrmModule.forFeature([User, Administrator, Tutor, Teacher]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1y' },
        };
      },
    }),
  ],
})
export class AuthModule {
  constructor(private readonly jwtService: JwtService) {
    const eco = this.jwtService.sign({ idUsuario: 236, idRol: 5 });
    const ghamec = this.jwtService.sign({ idUsuario: 237, idRol: 5 });
    const acm = this.jwtService.sign({ idUsuario: 331, idRol: 5 });
    const agro = this.jwtService.sign({ idUsuario: 596, idRol: 5 });
    const gep = this.jwtService.sign({ idUsuario: 22534, idRol: 5 });
    console.log({ eco, ghamec, acm, agro, gep });
  }
}
