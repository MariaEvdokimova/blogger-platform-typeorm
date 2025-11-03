import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConf from './core/db/db.config';
import { config } from 'dotenv';
import { envFilePaths } from './env-file-paths';

config({
  path: envFilePaths,
});

const db = databaseConf().database;

export default new DataSource({
  ...db,
  migrations: [__dirname + '/migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
} as DataSourceOptions);
