"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerStorage_1 = require("../storage/ServerStorage");
const cjs_ponyfill_1 = require("abortcontroller-polyfill/dist/cjs-ponyfill");
/**
 * Node Adapter - works with native NodeJS and with Express
 */
class NodeAdapter {
    /**
     * @param options Environment-specific options
     */
    constructor(options) {
        /**
         * Holds the Storage instance associated with this instance
         */
        this._storage = null;
        this.options = { ...options };
    }
    /**
     * Given a relative path, returns an absolute url using the instance base URL
     */
    relative(path) {
        return new URL(path, this.getUrl().href).href;
    }
    /**
     * Returns the protocol of the current request ("http" or "https")
     */
    getProtocol() {
        const req = this.options.request;
        const proto = req.socket.encrypted ? "https" : "http";
        return req.headers["x-forwarded-proto"] || proto;
    }
    /**
     * Given the current environment, this method must return the current url
     * as URL instance. In Node we might be behind a proxy!
     */
    getUrl() {
        const req = this.options.request;
        let host = req.headers.host;
        if (req.headers["x-forwarded-host"]) {
            host = req.headers["x-forwarded-host"];
            if (req.headers["x-forwarded-port"]) {
                host += ":" + req.headers["x-forwarded-port"];
            }
        }
        const protocol = this.getProtocol();
        // @ts-ignore
        const orig = String(req.headers["x-original-uri"] || req.originalUrl || req.url);
        return new URL(orig, protocol + "://" + host);
    }
    /**
     * Given the current environment, this method must redirect to the given
     * path
     * @param location The path to redirect to
     */
    redirect(location) {
        this.options.response.writeHead(302, { location });
        this.options.response.end();
    }
    /**
     * Returns a ServerStorage instance
     */
    getStorage() {
        if (!this._storage) {
            if (this.options.storage) {
                if (typeof this.options.storage == "function") {
                    this._storage = this.options.storage(this.options);
                }
                else {
                    this._storage = this.options.storage;
                }
            }
            else {
                this._storage = new ServerStorage_1.default(this.options.request);
            }
        }
        return this._storage;
    }
    /**
     * Returns a reference to the AbortController constructor. In browsers,
     * AbortController will always be available as global (native or polyfilled)
     */
    getAbortController() {
        return cjs_ponyfill_1.AbortController;
    }
}
exports.default = NodeAdapter;
