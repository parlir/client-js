import { fhirclient } from "./types";
import { Client } from "./lib/Client";
import * as util from "./util";
declare const FHIR: {
    Client: typeof Client;
    SMART: fhirclient.SMART;
    util: typeof util;
};
export = FHIR;
