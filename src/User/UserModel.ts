import { userKeys } from "./User.js";
import { sequelize } from "../db/DataSource.js";
import { DataTypes } from '@sequelize/core';


const User = sequelize.define("Users",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        [userKeys.email]: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        [userKeys.firstName]: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        [userKeys.lastName]: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });