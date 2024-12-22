import { Model, ModelStatic } from 'sequelize';

export type E<T extends object, k extends keyof T> = Model<T, Omit<T, k>>;

export type ET<T extends object> = E<T, never>;
