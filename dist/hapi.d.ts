import { fhirclient } from "./types";
import { ResponseToolkit, Request } from "hapi";
export declare function SMART(request: Request, h: ResponseToolkit, storage?: fhirclient.Storage | fhirclient.storageFactory): fhirclient.SMART;
