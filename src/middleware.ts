import { NextFunction, Request, Response } from "express"
import NodeAdapter from "./adapters/NodeAdapter"
import { Client } from "./Client"
import * as smart from "./smart"
import { fhirclient } from "./types"

declare global {
    namespace Express {
        export interface Request {
            fhirClient: Client;
        }
    }
}

/**
 * Usage:
 * ```
 * app.get('/launch', authorize(options))
 * ```
 */
export function authorize(options: fhirclient.AuthorizeParams | fhirclient.AuthorizeParams[]) {
    return function(request: Request, response: Response, next: NextFunction) {
        const adapter = new NodeAdapter({ request, response })
        smart.authorize(adapter, options).catch(next)
    }
}

/**
 * Usage:
 * ```
 * app.get('/', ready, (req, res, next) => req.fhirClient.request(...).then(res.json, next))
 * ```
 */
 export function ready(request: Request, response: Response, next: NextFunction) {
    const adapter = new NodeAdapter({ request, response })
    smart.ready(adapter).then(
        client => {
            request.fhirClient = client
            next()
        }
    ).catch(next)
}

/**
 * SMART authorize and ready combined on a single endpoint.
 * Usage:
 * ```
 * app.get('/', init(options), (req, res, next) => req.fhirClient.request(...).then(res.json, next))
 * ```
 */
 export function init(options: fhirclient.AuthorizeParams | fhirclient.AuthorizeParams[]) {
    return function(request: Request, response: Response, next: NextFunction) {
        const adapter = new NodeAdapter({ request, response })
        smart.init(adapter, options).then(
            client => {
                request.fhirClient = client
                next()
            }
        ).catch(next)
    }
}
