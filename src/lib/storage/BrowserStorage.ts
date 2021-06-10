import { fhirclient } from "../../types";


export default class Storage
{
    /**
     * Gets the value at `key`. Returns a promise that will be resolved
     * with that value (or undefined for missing keys).
     */
    async get(key: string): Promise<any>
    {
        const value = sessionStorage[key];
        if (value) {
            return JSON.parse(value);
        }
        return undefined;
    }

    /**
     * Sets the `value` on `key` and returns a promise that will be resolved
     * with the value that was set.
     */
    async set(key: string, value: any): Promise<any>
    {
        sessionStorage[key] = JSON.stringify(value);
        return value;
    }

    /**
     * Deletes the value at `key`. Returns a promise that will be resolved
     * with true if the key was deleted or with false if it was not (eg. if
     * did not exist).
     */
    async unset(key: string): Promise<boolean>
    {
        if (key in sessionStorage) {
            delete sessionStorage[key];
            return true;
        }
        return false;
    }

    async clear(): Promise<void>
    {
        return sessionStorage.clear()
    }

    async save(data: fhirclient.JsonObject)
    {
        for(const key of Object.keys(data)) {
            await this.set(key, data[key])
        }
        return data
    }
}
