/* global fhir */
const EventEmitter = require("events");
import * as jose from "node-jose";
import BrowserStorage      from "../../src/storage/BrowserStorage";
import { fhirclient }      from "../../src/types";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { PKCE_CHARSET, RECOMMENDED_CODE_VERIFIER_LENGTH } from "../../src/settings";


export default class BrowserEnvironment extends EventEmitter implements fhirclient.Adapter
{
    options: any;

    constructor(options = {})
    {
        super();
        this.options = {
            replaceBrowserHistory: true,
            fullSessionStorageSupport: true,
            refreshTokenWithCredentials: "same-origin",
            ...options
        };
    }

    get fhir()
    {
        return null;
    }

    getUrl()
    {
        return new URL(window.location.href);
    }

    redirect(to: string)
    {
        window.location.href = to;
        this.emit("redirect");
    }

    getStorage()
    {
        if (!this._storage) {
            this._storage = new BrowserStorage();
        }
        return this._storage;
    }

    relative(url: string)
    {
        return new URL(url, window.location.href).href;
    }

    getSmartApi(): any
    {
        return false;
    }

    btoa(str: string): string
    {
        return Buffer.from(str).toString("base64");
    }

    atob(str: string): string
    {
        return Buffer.from(str, "base64").toString("ascii");
    }

    getAbortController()
    {
        return AbortController as any;
    }

    /**
     * Generates a code_verifier and code_challenge, as specified in rfc7636.
     */
    generatePKCECodes()
    {
        const inputBytes: Buffer = jose.util.randomBytes(RECOMMENDED_CODE_VERIFIER_LENGTH);
        const input: string = Array.from(inputBytes).map((val: number) => PKCE_CHARSET[val % PKCE_CHARSET.length]).join("");
        const codeVerifier: string = jose.util.base64url.encode(input);

        return jose.JWA.digest("SHA-256", codeVerifier).then((code: Buffer) => ({
            codeChallenge: jose.util.base64url.encode(code),
            codeVerifier
        }));
    }
}
