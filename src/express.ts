
import { NextFunction, Request, Response } from "express"
import NodeAdapter    from "./lib/adapters/NodeAdapter"
import { Client }     from "./lib/Client"
import * as smart     from "./lib/smart"
import { fhirclient } from "./types"
import * as path      from "path"
import { makeArray }  from "./util"

declare global {
    namespace Express {
        export interface Request {

            /**
             * An authorized FHIR Client instance
             */
            fhirClient: Client;
        }
    }
}

interface SMARTOptions extends fhirclient.AuthorizeParams {
    launchUri?: string
}

function normalizeOptions(options: SMARTOptions | SMARTOptions[], request: Request) {
    const normalized = makeArray(options).map(opt => {

        const cfg = {
            launchUri  : "launch",
            redirectUri: "",
            ...opt
        }

        const baseUrl = request.baseUrl || "/"

        if (cfg.launchUri.match(/^https?\:\/\//)) {
            cfg.launchUri = new URL(cfg.launchUri).pathname
        }

        if (cfg.redirectUri.match(/^https?\:\/\//)) {
            cfg.redirectUri = new URL(cfg.redirectUri).pathname
        }

        if (!cfg.launchUri.startsWith(baseUrl)) {
            cfg.launchUri = path.resolve(baseUrl, cfg.launchUri);
        }

        if (!cfg.redirectUri.startsWith(baseUrl)) {
            cfg.redirectUri = path.resolve(baseUrl, cfg.redirectUri);
        }

        return cfg
    });

    return Array.isArray(options) ? normalized : normalized[0]
}

export function SMART(options: SMARTOptions | SMARTOptions[]) {
    return function(request: Request, response: Response, next: NextFunction) {
        const adapter = new NodeAdapter({ request, response })
        const cfg = normalizeOptions(options, request)
        const { launch, iss, fhirServiceUrl } = request.query;
        if (launch || iss || fhirServiceUrl) {
            return smart.authorize(adapter, cfg).catch(next)
        }
        smart.ready(adapter).then(
            client => {
                request.fhirClient = client
                next()
            },
            next
        )
    }
}
