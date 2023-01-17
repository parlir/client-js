import { fhirclient } from "../types";
import Client from "../Client";
declare const FHIR: {
    AbortController: {
        new (): AbortController;
        prototype: AbortController;
    };
    client: (state: string | fhirclient.ClientState) => Client;
    oauth2: {
        settings: fhirclient.BrowserFHIRSettings;
        ready: {
            (): Promise<Client>;
            (onSuccess: (client: Client) => any, onError?: (error: Error) => any, STORAGE_KEY?: string): Promise<any>;
        };
        authorize: (options: fhirclient.AuthorizeParams, STORAGE_KEY?: string) => Promise<string | void>;
        init: (options: fhirclient.AuthorizeParams, STORAGE_KEY?: string) => Promise<Client>;
    };
};
export = FHIR;
