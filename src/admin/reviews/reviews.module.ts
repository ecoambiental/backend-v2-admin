import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Enrollment } from 'ingepro-entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [TypeOrmModule.forFeature([Course, Enrollment]), AuthModule],
})
export class ReviewsModule {}
