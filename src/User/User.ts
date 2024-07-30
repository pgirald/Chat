import { getKeys } from "../utils/ObjectsMeta.js";

const user = {
    email: "",
    firstName: "",
    lastName: "",
    fullName: "",
}

export const userKeys = getKeys(user);

type User = typeof user;