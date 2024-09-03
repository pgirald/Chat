import { ModelStatic, QueryTypes } from "sequelize";
import { dbMap, Tables } from "../src/FakeData.js";
import * as fs from "fs";
import { testingSequelize } from "../src/Data_Source.js";

test.each<[string, boolean]>([["fakeData.json", true]])(
	"Check connection",
	async (fakesFile, shouldSync) => {
		try {
			if (shouldSync) {
				await testingSequelize.authenticate();
				console.log("Connection has been established successfully.");
				await testingSequelize.sync({ force: true });
				console.log("Tables created successfully.");
			}
			const fakeData: Tables = JSON.parse(
				fs.readFileSync(fakesFile).toString()
			);
			for (const tbl in dbMap) {
				console.log(`Starting [${tbl}] population`);
				await (dbMap[tbl] as ModelStatic<never>).bulkCreate(fakeData[tbl]);
				console.log(`[${tbl}] was populated`);
			}
			console.log("Tables populated succesfully");
			const results = await testingSequelize.query(
				"DBCC CHECKCONSTRAINTS WITH ALL_CONSTRAINTS;",
				{ type: QueryTypes.SELECT }
			);
			if (results.length === 0) {
				console.log(
					"The inserted data does not violate any existing constraint"
				);
			} else {
				console.log(
					"The in inserted data does violate some of the existing constraints:"
				);
				console.log(results);
			}
		} catch (error) {
			console.error("Something unexpected happened:\n\n", error);
		}
	},
	3600000
);