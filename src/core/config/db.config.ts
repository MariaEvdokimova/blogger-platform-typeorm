import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface DatabaseConfig {
  database: Partial<TypeOrmModuleOptions>;
}

export default (): DatabaseConfig => ({
  database: {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: true,
  },
});
