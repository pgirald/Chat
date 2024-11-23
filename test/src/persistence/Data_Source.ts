import { Sequelize } from 'sequelize';
import { defineModels } from '../../../src/persistence/models';

// export const testingSequelize = new Sequelize({
//   dialect: 'mssql',
//   dialectOptions: {
//     server: 'localhost',
//     options: {
//       requestTimeout: 3600000,
//       database: 'Chats',
//       port: 1433,
//       trustServerCertificate: true,
//     },
//     authentication: {
//       type: 'default',
//       options: {
//         userName: 'sa',
//         password: 'MyServerDB',
//       },
//     },
//   },
// });

export const testingSequelize = new Sequelize('sqlite::memory:');

// export const {
// 	Roles,
// 	Permissions,
// 	Assignations,
// 	Clients,
// 	Banned,
// 	Restrictions,
// 	Locks,
// 	Ringtones,
// 	Settings,
// 	Chats,
// 	Subscriptions,
// 	Messages,
// 	Attachments,
// } = defineModels(testingSequelize);

export const testingDbModels = defineModels(testingSequelize);
