import { generateData } from "../src/FakeData.js";
import * as fs from "fs";

test("Generate fake data", () => {
	const fd = generateData();
	console.log("----------------------FAKE DATA----------------------");
	fs.writeFileSync("tests/fakeData.json", JSON.stringify(fd),{ flag: "w" });
	console.log("-----------------------------------------------------");
});
