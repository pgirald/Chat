import { sequelize } from "./Data_Source.js";

test("Check connection", async () => {
	try {
		await sequelize.authenticate();
		console.log("Connection has been established successfully.");
        await sequelize.sync({force:true});
		console.log("Tables created successfully.");
	} catch (error) {
		console.error("Unable to connect to the databases:", error);
	}
});
