import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import * as entities from 'ingepro-entities';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  useFactory: (config: ConfigService) => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    autoLoadEntities: false,
    synchronize: false,
    logging: false,
    entities: Object.values(entities),
  }),
};
