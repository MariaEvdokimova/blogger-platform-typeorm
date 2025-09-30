import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerSetup(app: INestApplication, isSwaggerEnabled: boolean) {
   if (isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('BLOGGER API')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JwtAuth', // Это имя security scheme, можно использовать в @ApiBearerAuth()
      )
      .setVersion('1.0')
      .addBasicAuth(
        {
          type: 'http',
          scheme: 'basic',
        },
        'basicAuth',
      )
      .addApiKey(
        { 
          type: 'apiKey', 
          description: 'JWT refreshToken inside cookie. Must be correct, and must not expire',
          name: 'refreshToken', 
          in: 'cookie' 
        },
        'refreshToken',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('', app, document, {
      customSiteTitle: 'Blogger Swagger',
    });
  }
}
