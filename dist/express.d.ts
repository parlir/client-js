import { NextFunction, Request, Response } from "express";
import { Client } from "./lib/Client";
import { fhirclient } from "./types";
declare global {
    namespace Express {
        interface Request {
            /**
             * An authorized FHIR Client instance
             */
            fhirClient: Client;
        }
    }
}
interface SMARTOptions extends fhirclient.AuthorizeParams {
    launchUri?: string;
}
export declare function SMART(options: SMARTOptions | SMARTOptions[]): (request: Request, response: Response, next: NextFunction) => Promise<string | void>;
export {};
