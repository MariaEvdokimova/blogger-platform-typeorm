import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  pipesSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
}
