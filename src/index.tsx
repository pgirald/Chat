import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { renderToString } from "react-dom/server";
import { HelloPage } from "./View/HelloPage.js";

const app = express();
const server = createServer(app);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
	const page = renderToString(<HelloPage isMinor={false} />);
	console.log(page);
	res.send(page);
	//res.sendFile(join(__dirname, 'index.html'));
});

server.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});

console.log();
