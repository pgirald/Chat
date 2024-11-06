import { Sequelize } from "sequelize";
import { Banned as _Banned } from "./Entities.js";
import { defineModels } from "./models.js";

export const sequelize = new Sequelize({
	dialect: "mssql",
	dialectOptions: {
		server: "localhost",
		options: {
			database: "Chats",
			port: 1433,
			trustServerCertificate: true,
		},
		authentication: {
			type: "default",
			options: {
				userName: "sa",
				password: "MyServerDB",
			},
		},
	},
});

// export const sequelize = new Sequelize({
// 	dialect: MsSqlDialect,
// 	trustServerCertificate: true,
// 	server: "localhost",
// 	port: 1433,
// 	database: "Chats",
// 	authentication: {
// 		type: "default",
// 		options: {
// 			userName: "sa",
// 			password: "MyServerDB",
// 		},
// 	},
// });

// export const sequelize = new Sequelize({
// 	dialect: SqliteDialect,
// 	storage: ":memory:", // or ''
// 	pool: { max: 1, idle: Infinity, maxUses: Infinity },
// });

export const {
	Roles,
	Permissions,
	Assignations,
	Clients,
	Banned,
	Restrictions,
	Locks,
	Ringtones,
	Settings,
	Chats,
	Subscriptions,
	Messages,
	Attachments,
} = defineModels(sequelize);
