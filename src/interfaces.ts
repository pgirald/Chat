import { WebSocketAdapter } from "@nestjs/common";
import { Emitter } from "./chat/interfaces/emitter";

export interface GatewayDeps {
  emitterClass: new () => Emitter;
  adapter: new (INestApplicationContext) => WebSocketAdapter;
}