"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BrowserStorage_1 = require("../storage/BrowserStorage");
/**
 * Browser Adapter
 */
class BrowserAdapter {
    /**
     * @param options Environment-specific options
     */
    constructor(options = {}) {
        /**
         * Stores the URL instance associated with this adapter
         */
        this._url = null;
        /**
         * Holds the Storage instance associated with this instance
         */
        this._storage = null;
        this.options = {
            // Replaces the browser's current URL
            // using window.history.replaceState API or by reloading.
            replaceBrowserHistory: true,
            // Do we want to send cookies while making a request to the token
            // endpoint in order to obtain new access token using existing
            // refresh token. In rare cases the auth server might require the
            // client to send cookies along with those requests. In this case
            // developers will have to change this before initializing the app
            // like so:
            // `FHIR.oauth2.settings.refreshTokenWithCredentials = "include";`
            // or
            // `FHIR.oauth2.settings.refreshTokenWithCredentials = "same-origin";`
            // Can be one of:
            // "include"     - always send cookies
            // "same-origin" - only send cookies if we are on the same domain (default)
            // "omit"        - do not send cookies
            refreshTokenWithCredentials: "same-origin",
            ...options
        };
    }
    /**
     * Given a relative path, returns an absolute url using the instance base URL
     */
    relative(path) {
        return new URL(path, this.getUrl().href).href;
    }
    /**
     * In browsers we need to be able to (dynamically) check if fhir.js is
     * included in the page. If it is, it should have created a "fhir" variable
     * in the global scope.
     */
    get fhir() {
        // @ts-ignore
        return typeof fhir === "function" ? fhir : null;
    }
    /**
     * Given the current environment, this method must return the current url
     * as URL instance
     */
    getUrl() {
        if (!this._url) {
            this._url = new URL(location + "");
        }
        return this._url;
    }
    /**
     * Given the current environment, this method must redirect to the given
     * path
     */
    redirect(to) {
        location.href = to;
    }
    /**
     * Returns a BrowserStorage object which is just a wrapper around
     * sessionStorage
     */
    getStorage() {
        if (!this._storage) {
            this._storage = new BrowserStorage_1.default();
        }
        return this._storage;
    }
    /**
     * Returns a reference to the AbortController constructor. In browsers,
     * AbortController will always be available as global (native or polyfilled)
     */
    getAbortController() {
        return AbortController;
    }
}
exports.default = BrowserAdapter;
