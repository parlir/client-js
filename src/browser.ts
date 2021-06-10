
// Note: the following 2 imports appear as unused but they affect how tsc is
// generating type definitions!
import { fhirclient } from "./types";
import { Client } from "./lib/Client";

import * as util from "./util"
import * as smart from "./lib/smart"

// In Browsers we create an adapter, get the SMART api from it and build the
// global FHIR object
import BrowserAdapter from "./lib/adapters/BrowserAdapter";

const adapter = new BrowserAdapter();
// const { options } = adapter.getSmartApi();

// We have two kinds of browser builds - "pure" for new browsers and "legacy"
// for old ones. In pure builds we assume that the browser supports everything
// we need. In legacy mode, the library also acts as a polyfill. Babel will
// automatically polyfill everything except "fetch", which we have to handle
// manually.
// @ts-ignore
if (typeof FHIRCLIENT_PURE == "undefined") {
    const fetch = require("cross-fetch");
    require("abortcontroller-polyfill/dist/abortcontroller-polyfill-only");
    if (!window.fetch) {
        window.fetch    = fetch.default;
        window.Headers  = fetch.Headers;
        window.Request  = fetch.Request;
        window.Response = fetch.Response;
    }
}



// $lab:coverage:off$
const FHIR = {
    Client,
    SMART: {
        authorize(options: fhirclient.AuthorizeParams | fhirclient.AuthorizeParams[]) {
            return smart.authorize(adapter, options)
        },
        ready(onSuccess?: (client: Client) => any, onError?: (error: Error) => any) {
            return smart.ready(adapter, onSuccess, onError)
        },
        init(options: fhirclient.AuthorizeParams | fhirclient.AuthorizeParams[]) {
            return smart.init(adapter, options)
        }
    } as fhirclient.SMART,
    util
};

export = FHIR
// $lab:coverage:on$
