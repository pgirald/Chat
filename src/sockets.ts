import { Server } from "socket.io";

export type PrivateMessage = { content: string; to: string; from: string };

export const events = {
	privateMessage: "private message",
};

export function setupSockets(io: Server) {
	io.use(async (socket, next) => {
		const username = socket.handshake.auth.username;
		const sockets = await io.fetchSockets();
		if (!username) {
			return next(new Error("invalid username"));
		}
		if (sockets.some((s) => s.data.username === username)) {
			return next(new Error("The specified username is not avialable"));
		}
		socket.data.username = username;
		next();
	});

	io.on("connection", async (socket) => {
		const username: string = socket.data.username;

		const connectedCount = (await io.fetchSockets()).length; //(await io.fetchSockets()).length;

		socket.join(username);

		console.log(
			`${username} connected (${connectedCount} users are currently connected)`
		);

		socket.on(
			events.privateMessage,
			({ content, to }: { content: string; to: string }) => {
				socket.to(to).emit(events.privateMessage, {
					content,
					from: username,
					to: to,
				} as PrivateMessage);
			}
		);

		socket.on("disconnect", () => {
			socket.broadcast.emit("user disconnected", socket.data.username);
		});
	});
}
