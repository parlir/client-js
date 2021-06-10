import HapiAdapter from "./lib/adapters/HapiAdapter";
import { fhirclient } from "./types";
import { ResponseToolkit, Request } from "hapi";
import * as smart from "./lib/smart";
import { Client } from "./lib/Client";


export function SMART(request: Request, h: ResponseToolkit, storage?: fhirclient.Storage | fhirclient.storageFactory)
{
    const adapter = new HapiAdapter({ request, responseToolkit: h, storage });

    return {
        authorize(options: fhirclient.AuthorizeParams | fhirclient.AuthorizeParams[]) {
            return smart.authorize(adapter, options)
        },
        ready(onSuccess?: (client: Client) => any, onError?: (error: Error) => any) {
            return smart.ready(adapter, onSuccess, onError)
        },
        init(options: fhirclient.AuthorizeParams | fhirclient.AuthorizeParams[]) {
            return smart.init(adapter, options)
        }
    } as fhirclient.SMART
}

