"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMART = void 0;
const HapiAdapter_1 = require("./lib/adapters/HapiAdapter");
const smart = require("./lib/smart");
function SMART(request, h, storage) {
    const adapter = new HapiAdapter_1.default({ request, responseToolkit: h, storage });
    return {
        authorize(options) {
            return smart.authorize(adapter, options);
        },
        ready(onSuccess, onError) {
            return smart.ready(adapter, onSuccess, onError);
        },
        init(options) {
            return smart.init(adapter, options);
        }
    };
}
exports.SMART = SMART;
