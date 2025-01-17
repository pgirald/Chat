import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { gatewayDeps } from './gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useWebSocketAdapter(new gatewayDeps.adapter(app));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
