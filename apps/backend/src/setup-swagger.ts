import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import packageJson from '../package.json';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder().setTitle('QQ GroupKit').setVersion(packageJson.version).build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/api.json',
  });
}
