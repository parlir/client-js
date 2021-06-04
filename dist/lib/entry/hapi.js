"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.smart = void 0;

const HapiAdapter_1 = require("../adapters/HapiAdapter");

var cjs_ponyfill_1 = require("abortcontroller-polyfill/dist/cjs-ponyfill");

Object.defineProperty(exports, "AbortController", {
  enumerable: true,
  get: function () {
    return cjs_ponyfill_1.AbortController;
  }
});

function smart(request, h, storage) {
  return new HapiAdapter_1.default({
    request,
    responseToolkit: h,
    storage
  }).getSmartApi();
}

exports.smart = smart;