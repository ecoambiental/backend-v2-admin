import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate, Coupon, Course } from 'ingepro-entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CouponsController],
  providers: [CouponsService],
  imports: [
    TypeOrmModule.forFeature([Coupon, Course, Certificate]),
    AuthModule,
  ],
})
export class CouponsModule {}
