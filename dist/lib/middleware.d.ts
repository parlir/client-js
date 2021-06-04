import { NextFunction, Request, Response } from "express";
import { Client } from "./Client";
import { fhirclient } from "./types";
declare global {
    namespace Express {
        interface Request {
            fhirclient: Client;
        }
    }
}
/**
 * Usage:
 * ```
 * app.get('/launch', authorize(options))
 * ```
 */
export declare function authorize(options: fhirclient.AuthorizeParams | fhirclient.AuthorizeParams[]): (request: Request, response: Response) => void;
/**
 * Usage:
 * ```
 * app.get('/', ready, (req, res, next) => req.client.request(...).then(res.json, next))
 * ```
 */
export declare function ready(request: Request, response: Response, next: NextFunction): void;
/**
 * SMART authorize and ready combined on a single endpoint.
 * Usage:
 * ```
 * app.get('/', init(options), (req, res, next) => req.client.request(...).then(res.json, next))
 * ```
 */
export declare function init(options: fhirclient.AuthorizeParams | fhirclient.AuthorizeParams[]): (request: Request, response: Response, next: NextFunction) => void;
