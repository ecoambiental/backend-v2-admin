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
    const eco = this.jwtService.sign({
      idUsuario: 236,
      rol_id: 5,
      companyId: 1,
      companyName: 'Ecoambiental',
      companyPrefix: 'ECO',
      userName: 'Sonia',
      userSurnames: 'Zhunaula',
      type: 'Normal',
    });
    const ghamec = this.jwtService.sign({
      idUsuario: 237,
      rol_id: 5,
      companyId: 2,
      companyName: 'Ghamec',
      companyPrefix: 'GHA',
      userName: 'Sub admin Ghamec',
      userSurnames: 'Ingenieros',
      type: 'Normal',
    });
    const acm = this.jwtService.sign({
      idUsuario: 331,
      rol_id: 5,
      companyId: 3,
      companyName: 'Acm',
      companyPrefix: 'ACM',
      userName: 'Deysi',
      userSurnames: 'Olivera',
      type: 'Normal',
    });
    const agro = this.jwtService.sign({
      idUsuario: 596,
      rol_id: 5,
      companyId: 6,
      companyName: 'Agroambiental',
      companyPrefix: 'AGR',
      userName: 'Sub Admin Agroambiental',
      userSurnames: 'Agroambiental',
      type: 'Normal',
    });
    const gep = this.jwtService.sign({
      idUsuario: 22534,
      rol_id: 5,
      companyId: 5,
      companyName: 'Geplane',
      companyPrefix: 'GEP',
      userName: 'Deysi',
      userSurnames: 'Olivera',
      type: 'Normal',
    });
    console.log({ eco, ghamec, acm, agro, gep });
  }
}
