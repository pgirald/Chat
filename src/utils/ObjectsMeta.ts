export function getKeys<T extends { [key: string]: any }>(obj: T): { [prop in keyof T]: string } {
    let keys = {} as { [prop in keyof T]: string };
    for (let key in obj) {
        keys[key] = key;
    }
    return keys;
}