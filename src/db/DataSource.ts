import { Sequelize } from '@sequelize/core';
import { MsSqlDialect } from '@sequelize/mssql';

export const sequelize = new Sequelize({
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
