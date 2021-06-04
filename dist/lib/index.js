"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var cjs_ponyfill_1 = require("abortcontroller-polyfill/dist/cjs-ponyfill");

Object.defineProperty(exports, "AbortController", {
  enumerable: true,
  get: function () {
    return cjs_ponyfill_1.AbortController;
  }
});

var Client_1 = require("./Client");

Object.defineProperty(exports, "Client", {
  enumerable: true,
  get: function () {
    return Client_1.Client;
  }
});
exports.util = require("./util");
exports.express = require("./middleware");

var hapi_1 = require("./entry/hapi");

Object.defineProperty(exports, "hapi", {
  enumerable: true,
  get: function () {
    return hapi_1.smart;
  }
});