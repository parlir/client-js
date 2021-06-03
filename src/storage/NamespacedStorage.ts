import { fhirclient } from "../types";

export default class NamespacedStorage
{
    storage: fhirclient.Storage;

    key: string;

    constructor(storage: fhirclient.Storage, ns: string) {
        this.storage = storage;
        this.key = ns;
    }

    async get(key: string) {
        const branch = await this.storage.get(this.key);
        if (branch && typeof branch == "object") {
            return branch[key]
        }
        return undefined;
    }

    async set(key: string, value: any) {
        let branch = await this.storage.get(this.key);
        if (branch === undefined) branch = {}
        branch[key] = value
        await this.storage.set(this.key, branch)
        return value
    }

    async unset(key: string) {
        const branch = await this.storage.get(this.key);
        if (key in branch) {
            delete branch[key];
            await this.storage.set(this.key, branch)
            return true;
        }
        return false;
    }

    async save(data: any) {
        return this.storage.set(this.key, data)
    }

    async clear() {
        this.storage.unset(this.key)
    }
}