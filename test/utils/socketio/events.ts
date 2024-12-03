import { Socket } from 'socket.io-client';

export function waitFor(
  socket: Socket,
  event: string,
  handler?: (...args: any[]) => void,
) {
  return new Promise((resolve) => {
    socket.once(event, (args) => {
      handler?.(args);
      resolve('done');
    });
  });
}
