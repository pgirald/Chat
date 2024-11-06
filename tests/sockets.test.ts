import { createServer } from "http";
import { AddressInfo } from "net";
import { Server } from "socket.io";
import ioc, { Socket, SocketOptions } from "socket.io-client";
import { events, PrivateMessage, setupSockets } from "../src/sockets";

const usernames = { user1: "Maki", user2: "Yuji" };

function waitFor(socket: Socket, event: string) {
	return new Promise((resolve) => {
		socket.once(event, resolve);
	});
}

describe("my awesome project", () => {
	let io: Server;
	let user1: Socket, user2: Socket;

	beforeAll((done) => {
		const httpServer = createServer();
		io = new Server(httpServer);
		httpServer.listen(async () => {
			const port = (httpServer.address() as AddressInfo).port;
			user1 = ioc(`http://localhost:${port}`, { autoConnect: false });
			user2 = ioc(`http://localhost:${port}`, { autoConnect: false });
			setupSockets(io);
			user1.auth = { username: usernames.user1 };
			user2.auth = { username: usernames.user2 };
			user1.connect();
			user2.connect();
			await Promise.all([waitFor(user1, "connect"), waitFor(user2, "connect")]);
			done();
		});
	});

	test("should work", async () => {
		user2.once(events.privateMessage, (pmsg: PrivateMessage) => {
			expect(pmsg.content).toBe(`Hello ${usernames.user2}!!`);
			expect(pmsg.from).toBe(usernames.user1);
			expect(pmsg.to).toBe(usernames.user2);
		});
		user1.emit(events.privateMessage, {
			content: `Hello ${usernames.user2}!!`,
			from: usernames.user1,
			to: usernames.user2,
		} as PrivateMessage);
		await waitFor(user2, events.privateMessage);
		user1.once(events.privateMessage, (pmsg: PrivateMessage) => {
			expect(pmsg.content).toBe(`Hello ${usernames.user1}, what happens?`);
			expect(pmsg.from).toBe(usernames.user2);
			expect(pmsg.to).toBe(usernames.user1);
		});
		user2.emit(events.privateMessage, {
			content: `Hello ${usernames.user1}, what happens?`,
			from: usernames.user2,
			to: usernames.user1,
		} as PrivateMessage);
		await waitFor(user1, events.privateMessage);
	});

	afterAll(() => {
		io.close();
		user1.disconnect();
		user2.disconnect();
	});
});
// import { createServer } from "node:http";
// import { io as ioc } from "socket.io-client";
// import { Server } from "socket.io";
// import { AddressInfo } from "node:net";

// function waitFor(socket, event) {
// 	return new Promise((resolve) => {
// 		socket.once(event, resolve);
// 	});
// }

// describe("my awesome project", () => {
// 	let io, serverSocket, clientSocket;

// 	beforeAll((done) => {
// 		const httpServer = createServer();
// 		io = new Server(httpServer);
// 		httpServer.listen(async () => {
// 			const port = (httpServer.address() as AddressInfo).port;
// 			clientSocket = ioc(`http://localhost:${port}`);
// 			await waitFor(clientSocket, "connect");
// 			done();
// 		});
// 	});

//     test("should work", () => {});

// 	afterAll(() => {
// 		io.close();
// 		clientSocket.disconnect();
// 	});
// });
