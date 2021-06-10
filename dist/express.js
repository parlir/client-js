"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMART = void 0;
const NodeAdapter_1 = require("./lib/adapters/NodeAdapter");
const smart = require("./lib/smart");
const path = require("path");
const util_1 = require("./util");
function normalizeOptions(options, request) {
    const normalized = util_1.makeArray(options).map(opt => {
        const cfg = {
            launchUri: "launch",
            redirectUri: "",
            ...opt
        };
        const baseUrl = request.baseUrl || "/";
        if (cfg.launchUri.match(/^https?\:\/\//)) {
            cfg.launchUri = new URL(cfg.launchUri).pathname;
        }
        if (cfg.redirectUri.match(/^https?\:\/\//)) {
            cfg.redirectUri = new URL(cfg.redirectUri).pathname;
        }
        if (!cfg.launchUri.startsWith(baseUrl)) {
            cfg.launchUri = path.resolve(baseUrl, cfg.launchUri);
        }
        if (!cfg.redirectUri.startsWith(baseUrl)) {
            cfg.redirectUri = path.resolve(baseUrl, cfg.redirectUri);
        }
        return cfg;
    });
    return Array.isArray(options) ? normalized : normalized[0];
}
function SMART(options) {
    return function (request, response, next) {
        const adapter = new NodeAdapter_1.default({ request, response });
        const cfg = normalizeOptions(options, request);
        const { launch, iss, fhirServiceUrl } = request.query;
        if (launch || iss || fhirServiceUrl) {
            return smart.authorize(adapter, cfg).catch(next);
        }
        smart.ready(adapter).then(client => {
            request.fhirClient = client;
            next();
        }, next);
    };
}
exports.SMART = SMART;
