import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import http from "http";
import * as socketio from "socket.io";
import { setupSockets } from "./sockets";

const httpServer = http.createServer();

const io = new socketio.Server(httpServer, {
	cors: {
		origin: "http://localhost:8080",
	},
});

setupSockets(io);

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
