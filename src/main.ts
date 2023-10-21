import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Préfixe global pour toutes les routes de l'application
  app.setGlobalPrefix('api/v1');

  await app.listen(3000);
  console.log(
    `\nNestJS est démarré à l'adresse suivante: ${await app.getUrl()}\n`,
  );
}
bootstrap();
