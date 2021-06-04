import HapiAdapter from "../adapters/HapiAdapter";
import { fhirclient } from "../types";
import { ResponseToolkit, Request } from "hapi";

export { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";

export function smart(
    request: Request,
    h: ResponseToolkit,
    storage?: fhirclient.Storage | fhirclient.storageFactory
)
{
    return new HapiAdapter({
        request,
        responseToolkit: h,
        storage
    }).getSmartApi();
}

