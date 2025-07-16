import { Module } from '@nestjs/common';
import { databaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(databaseConfig),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {}
}
