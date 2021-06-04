"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = exports.ready = exports.authorize = void 0;

const NodeAdapter_1 = require("./adapters/NodeAdapter");

const smart = require("./smart");
/**
 * Usage:
 * ```
 * app.get('/launch', authorize(options))
 * ```
 */


function authorize(options) {
  return function (request, response) {
    const adapter = new NodeAdapter_1.default({
      request,
      response
    });
    smart.authorize(adapter, options);
  };
}

exports.authorize = authorize;
/**
 * Usage:
 * ```
 * app.get('/', ready, (req, res, next) => req.client.request(...).then(res.json, next))
 * ```
 */

function ready(request, response, next) {
  const adapter = new NodeAdapter_1.default({
    request,
    response
  });
  smart.ready(adapter).then(client => {
    request.fhirclient = client;
    next();
  }).catch(error => next(error));
}

exports.ready = ready;
/**
 * SMART authorize and ready combined on a single endpoint.
 * Usage:
 * ```
 * app.get('/', init(options), (req, res, next) => req.client.request(...).then(res.json, next))
 * ```
 */

function init(options) {
  return function (request, response, next) {
    const adapter = new NodeAdapter_1.default({
      request,
      response
    });
    smart.init(adapter, options).then(client => {
      request.fhirclient = client;
      next();
    }).catch(error => next(error));
  };
}

exports.init = init;