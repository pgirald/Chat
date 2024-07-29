import { Sequelize } from '@sequelize/core';
import { MsSqlDialect } from '@sequelize/mssql';

const sequelize = new Sequelize({
    dialect: MsSqlDialect,
    trustServerCertificate: true,
    server: 'localhost',
    port: 1433,
    database: 'Chats',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: 'MyServerDB',
        },
    },
});

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}