import { Sequelize, DataTypes, Model } from "sequelize";
import {
	Assignation,
	Banned as _Banned,
	Client,
	Named,
	Lock,
	Ringtone,
	Setting,
	Chat,
	Message,
	Attachment,
	Subscription,
} from "./Entities.js";

type E<T extends object, k extends keyof T> = Model<T, Omit<T, k>>;

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

const Roles = sequelize.define<E<Named, "id">>("Roles", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

const Permissions = sequelize.define<E<Named, "id">>("Permissions", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

const Assignations = sequelize.define<E<Assignation, "id">>("Assignations", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	role: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Roles,
			key: "id",
		},
		onDelete: "CASCADE",
	},
	permission: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Permissions,
			key: "id",
		},
		onDelete: "CASCADE",
	},
});

Roles.belongsToMany(Permissions, { through: Assignations, foreignKey: "role" });
Permissions.belongsToMany(Roles, {
	through: Assignations,
	foreignKey: "permission",
});

const Clients = sequelize.define<E<Client, "id" | "about_me" | "role">>(
	"Clients",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		password: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		country_code: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		phone_number: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		first_name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		last_name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		about_me: {
			type: DataTypes.STRING(400),
			allowNull: true,
		},
		role: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: Roles,
				key: "id",
			},
			onDelete: "SET NULL",
		},
	}
);

Clients.belongsTo(Roles, { foreignKey: "role" });
Roles.hasOne(Clients, { foreignKey: "role" });

const Banned = sequelize.define<E<_Banned, "id">>("Banned", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	motive: {
		type: DataTypes.STRING(500),
		allowNull: false,
	},
	client: {
		type: DataTypes.INTEGER,
		allowNull: false,
		unique: true,
		references: {
			model: Clients,
			key: "id",
		},
		onDelete: "CASCADE",
	},
});

Banned.belongsTo(Clients, { foreignKey: "client" });
Clients.hasOne(Banned, { foreignKey: "client" });

const Restrictions = sequelize.define<E<Named, "id">>("Restrictions", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: { type: DataTypes.STRING, allowNull: false },
});

const Locks = sequelize.define<E<Lock, never>>(
	"Locks",
	{
		restrictor: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Clients,
				key: "id",
			},
			onDelete: "CASCADE",
		},
		restricted: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Clients,
				key: "id",
			},
			onDelete: "CASCADE",
		},
		restriction: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Restrictions,
				key: "id",
			},
			onDelete: "CASCADE",
		},
	},
	{
		indexes: [
			{ unique: true, fields: ["restrictor", "restricted", "restriction"] },
		],
	}
);

Clients.belongsToMany(Clients, {
	through: Locks,
	foreignKey: "restrictor",
	as: "restricted_contacts",
});
Clients.belongsToMany(Clients, {
	through: Locks,
	foreignKey: "restricted",
	as: "resctictors",
});

Clients.belongsToMany(Restrictions, {
	through: Locks,
	foreignKey: "restricted",
	as: "client_restriction",
});
Restrictions.belongsToMany(Clients, {
	through: Locks,
	foreignKey: "restriction",
	as: "restricted_clients",
});

const Ringtones = sequelize.define<E<Ringtone, "id">>("Ringtones", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	blob: { type: DataTypes.BLOB, allowNull: false },
});

const Settings = sequelize.define<
	E<Setting, "id" | "notification_tone" | "groups_tone">
>("Settings", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	enable_notifications: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
	seen_status: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
	show_online_status: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
	discoverability: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
	chat_approval: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
	client: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Clients,
			key: "id",
		},
		onDelete: "CASCADE",
		unique: true,
	},
	notification_tone: {
		type: DataTypes.INTEGER,
		allowNull: true,
		references: {
			model: Ringtones,
			key: "id",
		},
		onDelete: "SET NULL",
	},
	groups_tone: {
		type: DataTypes.INTEGER,
		allowNull: true,
		references: {
			model: Ringtones,
			key: "id",
		},
		onDelete: "SET NULL",
	},
});

Clients.hasOne(Settings, { foreignKey: "client" });
Settings.belongsTo(Clients, { foreignKey: "client" });

Ringtones.hasMany(Settings, { foreignKey: "groups_tone" });
Settings.belongsTo(Ringtones, {
	foreignKey: "groups_tone",
});

Ringtones.hasMany(Settings, {
	foreignKey: "notification_tone",
});
Settings.belongsTo(Ringtones, {
	foreignKey: "notification_tone",
});

const Chats = sequelize.define<E<Chat, "id" | "custom_ringtone">>("Chats", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	owner: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Clients,
			key: "id",
		},
		onDelete: "NO ACTION", //The next subsciber becomes the owner
	},
	custom_ringtone: {
		type: DataTypes.INTEGER,
		allowNull: true,
		references: {
			model: Ringtones,
			key: "id",
		},
		onDelete: "SET NULL",
	},
});

Clients.hasMany(Chats, { foreignKey: "owner", as: "chat_owner" });
Chats.belongsTo(Clients, { foreignKey: "owner", as: "chat_owner" });

Ringtones.hasMany(Chats, { foreignKey: "custom_ringtone" });
Chats.belongsTo(Ringtones, { foreignKey: "custom_ringtone" });

const Subscriptions = sequelize.define<E<Subscription, never>>(
	"Subscriptions",
	{
		sub: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Clients,
				key: "id",
			},
			onDelete: "CASCADE",
		},
		chat: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Chats,
				key: "id",
			},
			onDelete: "CASCADE",
		},
	}
);

Chats.belongsToMany(Clients, {
	through: Subscriptions,
	foreignKey: "chat",
	as: "chat_clients",
});
Clients.belongsToMany(Chats, {
	through: Subscriptions,
	foreignKey: "sub",
	as: "client_chats",
});

const Messages = sequelize.define<E<Message, "id">>("Messages", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	content: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	time: {
		type: DataTypes.TIME,
		allowNull: false,
	},
	sender: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Clients,
			key: "id",
		},
		onDelete: "CASCADE",
	},
	chat: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Chats,
			key: "id",
		},
		onDelete: "CASCADE",
	},
});

Clients.hasMany(Messages, { foreignKey: "sender" });
Messages.belongsTo(Clients, { foreignKey: "sender" });

Chats.hasMany(Messages, { foreignKey: "chat" });
Messages.belongsTo(Chats, { foreignKey: "chat" });

const Attachments = sequelize.define<E<Attachment, "id">>("Attachments", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	blob: {
		type: DataTypes.BLOB,
		allowNull: false,
	},
	message: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Messages,
			key: "id",
		},
		onDelete: "CASCADE",
	},
});

Messages.hasMany(Attachments, { foreignKey: "message" });
Attachments.belongsTo(Messages, { foreignKey: "message" });
