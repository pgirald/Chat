import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Emitter } from './chat/interfaces/emitter';
import { WebSocketAdapter } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SocketIoEmitter } from './chat/SocketIoEmitter.service';

interface GatewayDeps {
  emitterClass: new () => Emitter;
  adapter: new (INestApplicationContext) => WebSocketAdapter;
}

const gatewayDeps: GatewayDeps = {
  emitterClass: SocketIoEmitter,
  adapter: IoAdapter,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new gatewayDeps.adapter(app));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
