import { IoAdapter } from "@nestjs/platform-socket.io";
import { SocketIoEmitter } from "./chat/SocketIoEmitter.service";
import { GatewayDeps } from "./interfaces";

export const gatewayDeps: GatewayDeps = {
    emitterClass: SocketIoEmitter,
    adapter: IoAdapter,
  };