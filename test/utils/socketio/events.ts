import { Socket } from 'socket.io-client';

export function waitFor(
  socket: Socket,
  event: string,
  handler?: (...args: any[]) => void,
) {
  return new Promise((resolve, reject) => {
    function rejectPromise(args) {
      console.log(args);
      reject(args);
      socket.off('connect_error', rejectPromise);
    }
    socket.on('connect_error', rejectPromise);
    socket.once(event, (args) => {
      handler?.(args);
      resolve('done');
      socket.off('connect_error', rejectPromise);
    });
  });
}
