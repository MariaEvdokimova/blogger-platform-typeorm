import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const coreConfig = app.get<CoreConfig>(CoreConfig);
  appSetup(app, coreConfig.isSwaggerEnabled); //глобальные настройки приложения

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5001',//true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true, // если используете куки (например, для refreshToken)
  });

  const port = coreConfig.port;
  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('NODE_ENV: ', coreConfig.env);
  });
}
bootstrap();
