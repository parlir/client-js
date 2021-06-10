"use strict";
/*
 * This file contains some shared functions. They are used by other modules, but
 * are defined here so that tests can import this library and test them.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = exports.getTargetWindow = exports.getPatientParam = exports.getAccessTokenExpiration = exports.jwtDecode = exports.btoa = exports.atob = exports.isBrowser = exports.randomString = exports.absolute = exports.setPath = exports.getPath = exports.fetchConformanceStatement = exports.getAndCache = exports.request = exports.responseToJSON = exports.checkResponse = exports.units = exports.debug = void 0;
const HttpError_1 = require("./HttpError");
const settings_1 = require("./settings");
const debug = require("debug");
// $lab:coverage:off$
// @ts-ignore
const { fetch } = typeof FHIRCLIENT_PURE !== "undefined" ? window : require("cross-fetch");
// $lab:coverage:on$
const _debug = debug("FHIR");
exports.debug = _debug;
/**
 * The cache for the `getAndCache` function
 */
const cache = {};
/**
 * A namespace with functions for converting between different measurement units
 */
exports.units = {
    cm({ code, value }) {
        ensureNumerical({ code, value });
        if (code == "cm")
            return value;
        if (code == "m")
            return value * 100;
        if (code == "in")
            return value * 2.54;
        if (code == "[in_us]")
            return value * 2.54;
        if (code == "[in_i]")
            return value * 2.54;
        if (code == "ft")
            return value * 30.48;
        if (code == "[ft_us]")
            return value * 30.48;
        throw new Error("Unrecognized length unit: " + code);
    },
    kg({ code, value }) {
        ensureNumerical({ code, value });
        if (code == "kg")
            return value;
        if (code == "g")
            return value / 1000;
        if (code.match(/lb/))
            return value / 2.20462;
        if (code.match(/oz/))
            return value / 35.274;
        throw new Error("Unrecognized weight unit: " + code);
    },
    any(pq) {
        ensureNumerical(pq);
        return pq.value;
    }
};
/**
 * Assertion function to guard arguments for `units` functions
 */
function ensureNumerical({ value, code }) {
    if (typeof value !== "number") {
        throw new Error("Found a non-numerical unit: " + value + " " + code);
    }
}
/**
 * Used in fetch Promise chains to reject if the "ok" property is not true
 */
async function checkResponse(resp) {
    if (!resp.ok) {
        const error = new HttpError_1.default(resp);
        await error.parse();
        throw error;
    }
    return resp;
}
exports.checkResponse = checkResponse;
/**
 * Used in fetch Promise chains to return the JSON version of the response.
 * Note that `resp.json()` will throw on empty body so we use resp.text()
 * instead.
 */
function responseToJSON(resp) {
    return resp.text().then(text => text.length ? JSON.parse(text) : "");
}
exports.responseToJSON = responseToJSON;
/**
 * This is our built-in request function. It does a few things by default
 * (unless told otherwise):
 * - Makes CORS requests
 * - Sets accept header to "application/json"
 * - Handles errors
 * - If the response is json return the json object
 * - If the response is text return the result text
 * - Otherwise return the response object on which we call stuff like `.blob()`
 */
function request(url, requestOptions = {}) {
    const { includeResponse, ...options } = requestOptions;
    return fetch(url, {
        mode: "cors",
        ...options,
        headers: {
            accept: "application/json",
            ...options.headers
        }
    })
        .then(checkResponse)
        .then((res) => {
        const type = res.headers.get("Content-Type") + "";
        if (type.match(/\bjson\b/i)) {
            return responseToJSON(res).then(body => ({ res, body }));
        }
        if (type.match(/^text\//i)) {
            return res.text().then(body => ({ res, body }));
        }
        return { res };
    })
        .then(({ res, body }) => {
        // Some servers will reply after CREATE with json content type but with
        // empty body. In this case check if a location header is received and
        // fetch that to use it as the final result.
        if (!body && res.status == 201) {
            const location = res.headers.get("location");
            if (location) {
                return request(location, { ...options, method: "GET", body: null, includeResponse });
            }
        }
        if (includeResponse) {
            return { body, response: res };
        }
        // For any non-text and non-json response return the Response object.
        // This to let users decide if they want to call text(), blob() or
        // something else on it
        if (body === undefined) {
            return res;
        }
        // Otherwise just return the parsed body (can also be "" or null)
        return body;
    });
}
exports.request = request;
/**
 * Makes a request using `fetch` and stores the result in internal memory cache.
 * The cache is cleared when the page is unloaded.
 * @param url The URL to request
 * @param requestOptions Request options
 * @param force If true, reload from source and update the cache, even if it has
 * already been cached.
 */
function getAndCache(url, requestOptions, force = process.env.NODE_ENV === "test") {
    if (force || !cache[url]) {
        cache[url] = request(url, requestOptions);
        return cache[url];
    }
    return Promise.resolve(cache[url]);
}
exports.getAndCache = getAndCache;
/**
 * Fetches the conformance statement from the given base URL.
 * Note that the result is cached in memory (until the page is reloaded in the
 * browser) because it might have to be re-used by the client
 * @param baseUrl The base URL of the FHIR server
 * @param [requestOptions] Any options passed to the fetch call
 */
function fetchConformanceStatement(baseUrl = "/", requestOptions) {
    const url = String(baseUrl).replace(/\/*$/, "/") + "metadata";
    return getAndCache(url, requestOptions).catch((ex) => {
        throw new Error(`Failed to fetch the conformance statement from "${url}". ${ex}`);
    });
}
exports.fetchConformanceStatement = fetchConformanceStatement;
/**
 * Walks through an object (or array) and returns the value found at the
 * provided path. This function is very simple so it intentionally does not
 * support any argument polymorphism, meaning that the path can only be a
 * dot-separated string. If the path is invalid returns undefined.
 * @param obj The object (or Array) to walk through
 * @param path The path (eg. "a.b.4.c")
 * @returns {*} Whatever is found in the path or undefined
 */
function getPath(obj, path = "") {
    path = path.trim();
    if (!path) {
        return obj;
    }
    let segments = path.split(".");
    let result = obj;
    while (result && segments.length) {
        const key = segments.shift();
        if (!key && Array.isArray(result)) {
            return result.map(o => getPath(o, segments.join(".")));
        }
        else {
            result = result[key];
        }
    }
    return result;
}
exports.getPath = getPath;
/**
 * Like getPath, but if the node is found, its value is set to @value
 * @param obj The object (or Array) to walk through
 * @param path The path (eg. "a.b.4.c")
 * @param value The value to set
 * @param createEmpty If true, create missing intermediate objects or arrays
 * @returns The modified object
 */
function setPath(obj, path, value, createEmpty = false) {
    path.trim().split(".").reduce((out, key, idx, arr) => {
        if (out && idx === arr.length - 1) {
            out[key] = value;
        }
        else {
            if (out && out[key] === undefined && createEmpty) {
                out[key] = arr[idx + 1].match(/^[0-9]+$/) ? [] : {};
            }
            return out ? out[key] : undefined;
        }
    }, obj);
    return obj;
}
exports.setPath = setPath;
/**
 * Given a path, converts it to absolute url based on the `baseUrl`. If baseUrl
 * is not provided, the result would be a rooted path (one that starts with `/`).
 * @param path The path to convert
 * @param baseUrl The base URL
 */
function absolute(path, baseUrl) {
    if (path.match(/^http/))
        return path;
    if (path.match(/^urn/))
        return path;
    return String(baseUrl || "").replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}
exports.absolute = absolute;
/**
 * Generates random strings. By default this returns random 8 characters long
 * alphanumeric strings.
 * @param strLength The length of the output string. Defaults to 8.
 * @param charSet A string containing all the possible characters.
 *     Defaults to all the upper and lower-case letters plus digits.
 * @category Utility
 */
function randomString(strLength = 8, charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
    const result = [];
    const len = charSet.length;
    while (strLength--) {
        result.push(charSet.charAt(Math.floor(Math.random() * len)));
    }
    return result.join("");
}
exports.randomString = randomString;
function isBrowser() {
    return typeof window === "object";
}
exports.isBrowser = isBrowser;
/**
 * Base64 to ASCII
 */
function atob(str) {
    return isBrowser() ?
        // Browsers have global atob method
        window.atob(str) :
        // "global." helps Webpack understand that it doesn't have to
        // include the Buffer code in the bundle
        global.Buffer.from(str, "base64").toString("ascii");
}
exports.atob = atob;
/**
 * ASCII to Base64
 */
function btoa(str) {
    return isBrowser() ?
        // Browsers have global btoa method
        window.btoa(str) :
        // "global." helps Webpack understand that it doesn't have to
        // include the Buffer code in the bundle
        global.Buffer.from(str).toString("base64");
}
exports.btoa = btoa;
/**
 * Decodes a JWT token and returns it's body.
 * @param token The token to read
 * @param env An `Adapter` or any other object that has an `atob` method
 * @category Utility
 */
function jwtDecode(token) {
    const payload = token.split(".")[1];
    return payload ? JSON.parse(atob(payload)) : null;
}
exports.jwtDecode = jwtDecode;
/**
 * Given a token response, computes and returns the expiresAt timestamp.
 * Note that this should only be used immediately after an access token is
 * received, otherwise the computed timestamp will be incorrect.
 * @param tokenResponse
 * @param env
 */
function getAccessTokenExpiration(tokenResponse) {
    const now = Math.floor(Date.now() / 1000);
    // Option 1 - using the expires_in property of the token response
    if (tokenResponse.expires_in) {
        return now + tokenResponse.expires_in;
    }
    // Option 2 - using the exp property of JWT tokens (must not assume JWT!)
    if (tokenResponse.access_token) {
        let tokenBody = jwtDecode(tokenResponse.access_token);
        if (tokenBody && tokenBody.exp) {
            return tokenBody.exp;
        }
    }
    // Option 3 - if none of the above worked set this to 5 minutes after now
    return now + 300;
}
exports.getAccessTokenExpiration = getAccessTokenExpiration;
/**
 * Given a conformance statement and a resource type, returns the name of the
 * URL parameter that can be used to scope the resource type by patient ID.
 */
function getPatientParam(conformance, resourceType) {
    // Find what resources are supported by this server
    const resources = getPath(conformance, "rest.0.resource") || [];
    // Check if this resource is supported
    const meta = resources.find((r) => r.type === resourceType);
    if (!meta) {
        throw new Error(`Resource "${resourceType}" is not supported by this FHIR server`);
    }
    // Check if any search parameters are available for this resource
    if (!Array.isArray(meta.searchParam)) {
        throw new Error(`No search parameters supported for "${resourceType}" on this FHIR server`);
    }
    // This is a rare case but could happen in generic workflows
    if (resourceType == "Patient" && meta.searchParam.find((x) => x.name == "_id")) {
        return "_id";
    }
    // Now find the first possible parameter name
    const out = settings_1.patientParams.find(p => meta.searchParam.find((x) => x.name == p));
    // If there is no match
    if (!out) {
        throw new Error("I don't know what param to use for " + resourceType);
    }
    return out;
}
exports.getPatientParam = getPatientParam;
/**
 * Resolves a reference to target window. It may also open new window or tab if
 * the `target = "popup"` or `target = "_blank"`.
 * @param target
 * @param width Only used when `target = "popup"`
 * @param height Only used when `target = "popup"`
 */
async function getTargetWindow(target, width = 800, height = 720) {
    // The target can be a function that returns the target. This can be
    // used to open a layer pop-up with an iframe and then return a reference
    // to that iframe (or its name)
    if (typeof target == "function") {
        target = await target();
    }
    // The target can be a window reference
    if (target && typeof target == "object") {
        return target;
    }
    // At this point target must be a string
    if (typeof target != "string") {
        _debug("Invalid target type '%s'. Failing back to '_self'.", typeof target);
        return self;
    }
    // Current window
    if (target == "_self") {
        return self;
    }
    // The parent frame
    if (target == "_parent") {
        return parent;
    }
    // The top window
    if (target == "_top") {
        return top;
    }
    // New tab or window
    if (target == "_blank") {
        let error, targetWindow = null;
        try {
            targetWindow = window.open("", "SMARTAuthPopup");
            if (!targetWindow) {
                throw new Error("Perhaps window.open was blocked");
            }
        }
        catch (e) {
            error = e;
        }
        if (!targetWindow) {
            _debug("Cannot open window. Failing back to '_self'. %s", error);
            return self;
        }
        else {
            return targetWindow;
        }
    }
    // Popup window
    if (target == "popup") {
        let error, targetWindow = null;
        // if (!targetWindow || targetWindow.closed) {
        try {
            targetWindow = window.open("", "SMARTAuthPopup", [
                "height=" + height,
                "width=" + width,
                "menubar=0",
                "resizable=1",
                "status=0",
                "top=" + (screen.height - height) / 2,
                "left=" + (screen.width - width) / 2
            ].join(","));
            if (!targetWindow) {
                throw new Error("Perhaps the popup window was blocked");
            }
        }
        catch (e) {
            error = e;
        }
        if (!targetWindow) {
            _debug("Cannot open window. Failing back to '_self'. %s", error);
            return self;
        }
        else {
            return targetWindow;
        }
    }
    // Frame or window by name
    const winOrFrame = frames[target];
    if (winOrFrame) {
        return winOrFrame;
    }
    _debug("Unknown target '%s'. Failing back to '_self'.", target);
    return self;
}
exports.getTargetWindow = getTargetWindow;
function assert(condition, message) {
    if (!(condition)) {
        throw new Error(message);
    }
}
exports.assert = assert;
