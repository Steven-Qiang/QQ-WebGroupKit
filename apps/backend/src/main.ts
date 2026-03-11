import type { NestExpressApplication } from '@nestjs/platform-express';
import { exec } from 'child_process';
import path, { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';

const webDist = join(__dirname, '../../../frontend/dist/');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3000;

  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(webDist);
  app.enableCors();
  app.setGlobalPrefix('/api');

  setupSwagger(app);

  await app.listen(port);

  console.log(`服务启动于: http://127.0.0.1:${port}`);
  console.log(`Swagger 文档: http://127.0.0.1:${port}/docs`);

  postBootstrap(port);
}

function postBootstrap(port: string | number) {
  if (process.env.NODE_ENV == 'development') {
    const stream = exec(`node ${path.join(__dirname, './generate-api')} http://127.0.0.1:${port}/docs/api.json`);
    stream.stdout!.on('data', (data) => {
      process.stdout.write(data);
    });
    stream.stderr!.on('data', (data) => {
      process.stderr.write(data);
    });
  }
}

bootstrap();
