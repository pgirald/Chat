import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import http from "http";
import * as socketio from "socket.io";

const httpServer = http.createServer();

const io = new socketio.Server(httpServer, {
	cors: {
		origin: "http://localhost:8080",
	},
});

io.use((socket, next) => {
	const username = socket.handshake.auth.username;
	if (!username) {
		return next(new Error("invalid username"));
	}
	if (
		[...io.of("/").sockets.values()].some((s) => s.data.username === username)
	) {
		return next(new Error("The specified username is not avialable"));
	}
	socket.data.username = username;
	next();
});

io.on("connection", (socket) => {
	// fetch existing users
	const otherSockets = [...io.of("/").sockets.values()].filter(
		(s) => s.id !== socket.id
	);

	const users = [];

	for (let socket of otherSockets) {
		users.push({
			userID: socket.data.username,
			username: socket.data.username,
		});
	}

	socket.emit("users", users);

	// notify existing users
	socket.broadcast.emit("user connected", {
		userID: socket.data.username,
		username: socket.data.username,
	});

	// forward the private message to the right recipient
	socket.on("private message", ({ content, to }) => {
		const sockets = [...io.of("/").sockets.values()];
		console.log(`${to}\n`);
		console.log(sockets.map((s) => s.data.username));
		console.log(sockets.length);
		const receipt = sockets.find((s) => s.data.username === to);
		receipt &&
			socket.to(receipt.id).emit("private message", {
				content,
				from: socket.data.username,
			});
	});

	// notify users upon disconnection
	socket.on("disconnect", () => {
		socket.broadcast.emit("user disconnected", socket.data.username);
	});
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () =>
	console.log(`server listening at http://localhost:${PORT}`)
);

// const app = express();
// const server = createServer(app);

// const __dirname = dirname(fileURLToPath(import.meta.url));

// app.get('/', (req, res) => {
//   res.sendFile(join(__dirname, 'index.html'));
// });

// server.listen(3000, () => {
//     console.log('server running at http://localhost:3000');
// });
