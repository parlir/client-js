import { fhirclient } from "../types";
import { Client } from "../Client";
import * as util from "../util";
declare const FHIR: {
    AbortController: {
        new (): AbortController;
        prototype: AbortController;
    };
    client: (state: string | fhirclient.SMARTState) => Client;
    oauth2: {
        settings: fhirclient.BrowserFHIRSettings;
        ready: {
            (): Promise<Client>;
            (onSuccess: (client: Client) => any, onError?: (error: Error) => any): Promise<any>;
        };
        authorize: (options: fhirclient.AuthorizeParams) => Promise<string | void>;
        init: (options: fhirclient.AuthorizeParams) => Promise<Client>;
    };
    util: typeof util;
};
export = FHIR;
