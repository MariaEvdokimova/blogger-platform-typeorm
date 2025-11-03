import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface DatabaseConfig {
  database: Partial<TypeOrmModuleOptions>;
}

export default (): DatabaseConfig => ({
  database: {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: process.env.DB_LOGGING_LEVEL === 'true',
  },
});
