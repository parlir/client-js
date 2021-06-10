
import { expect }        from "@hapi/code"
import * as Lab          from "@hapi/lab"
import * as express      from "express"
import * as session      from "express-session"
import { fetch }         from "cross-fetch"
import * as nock         from "nock"
import { SMART }         from "../src/express"
import Adapter           from "../src/lib/adapters/NodeAdapter";
// import { KEY }           from "../src/lib/smart";
import ServerStorage     from "../src/lib/storage/ServerStorage";
// import FHIR              from "../src/lib/adapters/NodeAdapter";

// Mocks
import mockServer        from "./mocks/mockServer";
// import HttpRequest       from "./mocks/HttpRequest";
// import HttpResponse      from "./mocks/HttpResponse";
// import MemoryStorage     from "./mocks/MemoryStorage";
import { Server, IncomingMessage } from "http";
import { AddressInfo } from "net"
import { assert } from "../src/lib"

export const lab = Lab.script();
const { it, describe, before, after, afterEach } = lab;

let mockDataServer, mockUrl;

const ACCESS_TOKEN_RESPONSE = {
    patient     : "b2536dd3-bccd-4d22-8355-ab20acdf240b",
    encounter   : "e3ec2d15-4c27-4607-a45c-2f84962b0700",
    token_type  : "bearer",
    scope       : "launch openid fhirUser user/*.* patient/*.* launch/encounter launch/patient profile",
    client_id   : "whatever",
    expires_in  : 3600,
    access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuZWVkX3BhdGllbnRfYmFubmVyIjp0cnVlLCJ" +
                    "zbWFydF9zdHlsZV91cmwiOiJodHRwczovL2xhdW5jaC5zbWFydGhlYWx0aGl0Lm9yZy9zbWFydC1" +
                    "zdHlsZS5qc29uIiwicGF0aWVudCI6ImIyNTM2ZGQzLWJjY2QtNGQyMi04MzU1LWFiMjBhY2RmMjQ" +
                    "wYiIsImVuY291bnRlciI6ImUzZWMyZDE1LTRjMjctNDYwNy1hNDVjLTJmODQ5NjJiMDcwMCIsInJ" +
                    "lZnJlc2hfdG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKamI" +
                    "yNTBaWGgwSWpwN0ltNWxaV1JmY0dGMGFXVnVkRjlpWVc1dVpYSWlPblJ5ZFdVc0luTnRZWEowWDN" +
                    "OMGVXeGxYM1Z5YkNJNkltaDBkSEJ6T2k4dmJHRjFibU5vTG5OdFlYSjBhR1ZoYkhSb2FYUXViM0p" +
                    "uTDNOdFlYSjBMWE4wZVd4bExtcHpiMjRpTENKd1lYUnBaVzUwSWpvaVlqSTFNelprWkRNdFltTmp" +
                    "aQzAwWkRJeUxUZ3pOVFV0WVdJeU1HRmpaR1l5TkRCaUlpd2laVzVqYjNWdWRHVnlJam9pWlRObFl" +
                    "6SmtNVFV0TkdNeU55MDBOakEzTFdFME5XTXRNbVk0TkRrMk1tSXdOekF3SW4wc0ltTnNhV1Z1ZEY" +
                    "5cFpDSTZJbTE1WDNkbFlsOWhjSEFpTENKelkyOXdaU0k2SW05d1pXNXBaQ0JtYUdseVZYTmxjaUJ" +
                    "2Wm1ac2FXNWxYMkZqWTJWemN5QjFjMlZ5THlvdUtpQndZWFJwWlc1MEx5b3VLaUJzWVhWdVkyZ3Z" +
                    "aVzVqYjNWdWRHVnlJR3hoZFc1amFDOXdZWFJwWlc1MElIQnliMlpwYkdVaUxDSjFjMlZ5SWpvaVV" +
                    "ISmhZM1JwZEdsdmJtVnlMM050WVhKMExWQnlZV04wYVhScGIyNWxjaTAzTVRRNE1qY3hNeUlzSW1" +
                    "saGRDSTZNVFUxT1RFek9Ea3hNeXdpWlhod0lqb3hOVGt3TmpjME9URTBmUS4tRXk3d2RGU2xtZm9" +
                    "Rcm03SE54QWdKUUJKUEtkdGZIN2tMMVo5MUw2MF84IiwidG9rZW5fdHlwZSI6ImJlYXJlciIsInN" +
                    "jb3BlIjoib3BlbmlkIGZoaXJVc2VyIG9mZmxpbmVfYWNjZXNzIHVzZXIvKi4qIHBhdGllbnQvKi4" +
                    "qIGxhdW5jaC9lbmNvdW50ZXIgbGF1bmNoL3BhdGllbnQgcHJvZmlsZSIsImNsaWVudF9pZCI6Im1" +
                    "5X3dlYl9hcHAiLCJleHBpcmVzX2luIjozNjAwLCJpZF90b2tlbiI6ImV5SjBlWEFpT2lKS1YxUWl" +
                    "MQ0poYkdjaU9pSlNVekkxTmlKOS5leUp3Y205bWFXeGxJam9pVUhKaFkzUnBkR2x2Ym1WeUwzTnR" +
                    "ZWEowTFZCeVlXTjBhWFJwYjI1bGNpMDNNVFE0TWpjeE15SXNJbVpvYVhKVmMyVnlJam9pVUhKaFk" +
                    "zUnBkR2x2Ym1WeUwzTnRZWEowTFZCeVlXTjBhWFJwYjI1bGNpMDNNVFE0TWpjeE15SXNJbUYxWkN" +
                    "JNkltMTVYM2RsWWw5aGNIQWlMQ0p6ZFdJaU9pSmtZakl6WkRCa1pUSTFOamM0WlRZM01EazVZbU0" +
                    "wTXpRek1qTmtZekJrT1RZMU1UTmlOVFV5TW1RMFlqYzBNV05pWVRNNVpqZGpPVEprTUdNME5tRmx" +
                    "JaXdpYVhOeklqb2lhSFIwY0RvdkwyeGhkVzVqYUM1emJXRnlkR2hsWVd4MGFHbDBMbTl5WnlJc0l" +
                    "tbGhkQ0k2TVRVMU9URXpPRGt4TkN3aVpYaHdJam94TlRVNU1UUXlOVEUwZlEuT3RiSWNzNW55RUt" +
                    "hRDJrQVBhc20xRFlGaXhIdlZia0Mxd1F5czNvYTNULTRUZjh3eFc1Nmh6VUswWlFlT0tfZ0VJeGl" +
                    "TRm45dExvVXZLYXVfTTFXUlZEMTFGUHl1bHZzMVE4RWJHNVBRODNNQnVkY3BaUUpfdXVGYlZjR3N" +
                    "ETXkyeEVhXzhqQUhrSFBBVk5qajhGUnNRQ1JaQzBIZmcwTmJYbGkzeU9oQUZLMUxxVFVjcm5qZnd" +
                    "ELXNhazBVR1FTMUg2T2dJTG5UWUxybFRUSW9uZm5XUmRwV0pqakloM19HQ2s1ay04TFU4QUFSYVB" +
                    "jU0UzWmhlem9LVFNmd1FuMVhPMTAxZzVoMzM3cFpsZWFJbEZsaHhQUkZTS3RwWHo3QkVlemtVaTV" +
                    "DSnFONGQycU5vQks5a2FwbGpGWUVWZFBqUnFhQm50NGJsbXlGUlhqaGRNTndBIiwiaWF0IjoxNTU" +
                    "5MTM4OTE0LCJleHAiOjE1NTkxNDI1MTR9.lhfmhXYfoaI4QcJYvFnr2FMn_RHO8aXSzzkXzwNpc7w",
    code        : "123"
}

const FHIR_SERVER_URL = "http://fhirserver.dev"
const AUTH_SERVER_URL = "http://authserver.dev"
const APP_SERVER_PORT = 23456



function startServer(app: express.Application): Promise<{ server: Server, address: string }> {
    return new Promise((resolve) => {
        // app.use(function (
        //     error: Error,
        //     req: express.Request,
        //     res: express.Response,
        //     next: express.NextFunction
        // ) {
        //     // console.dir(error)
        //     console.error(error);
        //     res.status(500).end()
        // });
        let server = app.listen(APP_SERVER_PORT, "127.0.0.1", () => {
            const { address, port } = server.address() as AddressInfo
            resolve({ server, address: `http://${address}:${port}`})
        })    
    })
}


before(() => {
    // debug.enable("FHIRClient:*");
    return new Promise((resolve, reject) => {
        // @ts-ignore
        mockDataServer = mockServer.listen(null, "0.0.0.0", error => {
            if (error) {
                return reject(error);
            }
            const addr = mockDataServer.address();
            mockUrl = `http://127.0.0.1:${addr.port}`;
            // console.log(`Mock Data Server listening at ${mockUrl}`);
            resolve(void 0);
        });
    });
});

after(() => {
    if (mockDataServer && mockDataServer.listening) {
        return new Promise(resolve => {
            mockUrl = "";
            mockDataServer.close(error => {
                if (error) {
                    console.log("Error shutting down the mock-data server: ", error);
                }
                // console.log("Mock Data Server CLOSED!");
                resolve(void 0);
            });
        });
    }
});

afterEach(() => {
    mockServer.clear();
});

// ----------------------------------------------------------------------------

describe("Complete authorization [SERVER]", () => {

    let appServer: Server;

    afterEach(() => {
        nock.cleanAll()
        if (appServer) {
            return new Promise((resolve, reject) => appServer.close((error) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(void 0)
                }
            }))
        }
    })

    async function launchApp(app: express.Application, { launchUri }: { launchUri: string } = { launchUri: "/launch" }) {
        const { address, server } = await startServer(app);
        appServer = server;
        let cookie: string;
    
        // Mock all involved destinations
        // --------------------------------------------------------------------
        const fhirServer = nock(FHIR_SERVER_URL);
        const authServer = nock(AUTH_SERVER_URL);
    
        fhirServer.get('/.well-known/smart-configuration').reply(200, {
            authorization_endpoint: AUTH_SERVER_URL + '/authorize',
            token_endpoint: AUTH_SERVER_URL + '/token'
        });
    
        fhirServer.get('/metadata').query(true).reply(404);
    
        authServer.get("/authorize").query(true).reply((uri) => {
            const query = new URLSearchParams(uri.split("?", 2).pop());
            return [ 302, "", { location: `${query.get("redirect_uri")}?code=234&state=${query.get("state")}` }]
        })
    
        authServer.post("/token").query(true).reply(200, ACCESS_TOKEN_RESPONSE)
        
        // We are the EHR here! Request the launch uri but don't let it redirect
        // because we want to capture the cookie
        // --------------------------------------------------------------------
        const launchURL = new URL(launchUri, address)
        const params    = launchURL.searchParams;
        const hasFhirServiceUrl = params.has("fhirServiceUrl")
        
        let hasIss    = !hasFhirServiceUrl && params.has("iss")
        let hasLaunch = !hasFhirServiceUrl && params.has("launch")

        if (!hasFhirServiceUrl) {
            if (!hasLaunch) {
                params.set("launch", "123")
                hasLaunch = true
            }

            if (!hasIss) {
                params.set("iss", FHIR_SERVER_URL)
                hasIss = true
            }
        }

        // console.log(1, launchURL.href)

        
        // --------------------------------------------------------------------
        // Step 1 - call the launch endpoint:
        // - EHR Launch        - call it with launch and iss
        // - Standalone Launch - call it with iss
        // - Fake Launch       - call it with fhirServiceUrl
        // --------------------------------------------------------------------
        const res1 = await fetch(launchURL.href, {
            redirect   : "manual",
            credentials: "include", // hasIss ? "omit" : "include",
            mode       : "navigate"
        })

        // --------------------------------------------------------------------
        // Step 2 - handle the redirect
        // - EHR Launch        - redirects to the auth server
        // - Standalone Launch - redirects to the auth server
        // - Fake Launch       - redirects to the redirectUri with state param
        // --------------------------------------------------------------------
        const redirectLocation = res1.headers.get("location")
        const cookieHeader = res1.headers.get("set-cookie")
        assert(redirectLocation, `No redirect location returned by the launch call (${launchURL.href}). Status ${res1.status}`)
        assert(cookieHeader, `No cookie returned by the launch call (${launchURL.href}). ${await res1.text()}`)
        cookie = cookieHeader.replace(/;.+$/, "")
        const res2 = await fetch(redirectLocation, {
            redirect: "manual",
            mode    : "navigate",
            credentials: "include", // hasFhirServiceUrl ? "include" : "omit",
            headers    : { cookie } // hasFhirServiceUrl ? { cookie } : {}
        })

        // --------------------------------------------------------------------
        // Step 2.1 - early exit for fake auth
        // We are already at the redirect url. No further redirects are needed.
        // --------------------------------------------------------------------
        if (!res2.headers.get("location")) {
            return {
                response: res2,
                cookie
            }
        }
        

        // --------------------------------------------------------------------
        // Step 3 - the redirect endpoint
        // - EHR Launch        - we should have code and state params
        // - Standalone Launch - we should have code and state params
        // - Fake Launch       - we should have a redirectUri param
        // --------------------------------------------------------------------
        // console.log(2, res2.headers.get("location"))
        const res3 = await fetch(res2.headers.get("location") + "", {
            redirect   : "manual",
            credentials: "include",
            mode       : "navigate",
            headers    : { cookie }
        });

        if (!hasFhirServiceUrl && res3.headers.get("location")) {
            return {
                response: await fetch(res3.headers.get("location") + "", {
                    // redirect   : "follow",
                    credentials: "include",
                    mode       : "navigate",
                    headers    : { cookie }
                }),
                cookie
            };
        }

        return {
            response: res3,
            cookie
        };
    }

    it ("app.use(SMART())", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        app.use(SMART({ clientId: "whatever" }))
        app.get("/", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app);
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
        
    });

    it ("app.use(SMART({ launchUri: 'my-launch' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use(SMART({
            clientId: "clientId1", 
            launchUri: "my-launch"
        }))

        app.get("/", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/my-launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use(SMART({ launchUri: './my-launch' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use(SMART({
            clientId: "clientId1", 
            launchUri: "./my-launch"
        }))

        app.get("/", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/my-launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use(SMART({ launchUri: '/my-launch' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use(SMART({
            clientId: "clientId1", 
            launchUri: "/my-launch"
        }))

        app.get("/", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/my-launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use(SMART({ launchUri: 'http://.../my-launch' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use(SMART({
            clientId: "clientId1", 
            launchUri: `http://127.0.0.1:${APP_SERVER_PORT}/my-launch`
        }))

        app.get("/", (req, res) => res.end(req.fhirClient.patient.id))
        
        const { response } = await launchApp(app, { launchUri: `http://127.0.0.1:${APP_SERVER_PORT}/my-launch` });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use('/base/path', SMART())", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use("/base/path", SMART({ clientId: "clientId1" }))

        app.get("/base/path", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/base/path/launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use('/base/path', SMART({ launchUri: 'my-launch' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use("/base/path", SMART({
            clientId: "clientId1", 
            launchUri: "my-launch"
        }))

        app.get("/base/path", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/base/path/my-launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use('/base/path', SMART({ launchUri: './my-launch' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use("/base/path", SMART({
            clientId: "clientId1", 
            launchUri: "./my-launch"
        }))

        app.get("/base/path", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/base/path/my-launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use('/base/path', SMART({ launchUri: '/base/path/my-launch' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use("/base/path", SMART({
            clientId: "clientId1", 
            launchUri: "/base/path/my-launch"
        }))

        app.get("/base/path", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/base/path/my-launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use('/base/path', SMART({ launchUri: 'http://.../base/path/my-launch' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use("/base/path", SMART({
            clientId: "clientId1", 
            launchUri: `http://127.0.0.1:${APP_SERVER_PORT}/base/path/my-launch`
        }))

        app.get("/base/path", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: `http://127.0.0.1:${APP_SERVER_PORT}/base/path/my-launch` });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use('/base/path', SMART({ redirectUri: 'my-app' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use("/base/path", SMART({
            clientId: "clientId1", 
            redirectUri: "my-app"
        }))

        app.get("/base/path/my-app", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/base/path/launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use('/base/path', SMART({ redirectUri: './my-app' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use("/base/path", SMART({
            clientId: "clientId1", 
            redirectUri: "./my-app"
        }))

        app.get("/base/path/my-app", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/base/path/launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use('/base/path', SMART({ redirectUri: '/base/path/my-app' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use("/base/path", SMART({
            clientId: "clientId1", 
            redirectUri: "/base/path/my-app"
        }))

        app.get("/base/path/my-app", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/base/path/launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use('/base/path', SMART({ redirectUri: 'http://.../base/path/my-app' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use("/base/path", SMART({
            clientId: "clientId1", 
            redirectUri: `http://127.0.0.1:${APP_SERVER_PORT}/base/path/my-app`
        }))

        app.get("/base/path/my-app", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/base/path/launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    it ("app.use('/base/path', SMART({ launchUri: 'my-launch', redirectUri: 'my-app' }))", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use("/base/path", SMART({
            clientId: "clientId1", 
            launchUri: "my-launch",
            redirectUri: "my-app"
        }))

        app.get("/base/path/my-app", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/base/path/my-launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    })

    describe("with router", () => {
        it ("app.use(SMART())", async () => {
            const app = express()
            app.use(session({ secret: "my secret", resave: false, saveUninitialized: false }));
            const router = express.Router({ mergeParams: true });
            router.use(SMART({ clientId: "whatever" }))
            router.get("/", (req, res) => res.end(req.fhirClient.patient.id))
            app.use("/fhir", router);
            const { response } = await launchApp(app, { launchUri: "/fhir/launch" });
            const patientId = await response.text()
            expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
        });
        
        it ("app.use(SMART({ launchUri: 'my-launch' }))", async () => {
            const app = express()
            app.use(session({ secret: "my secret", resave: false, saveUninitialized: false }));
            const router = express.Router({ mergeParams: true });
            router.use(SMART({
                clientId: "clientId1", 
                launchUri: "my-launch"
            }))
            router.get("/", (req, res) => res.end(req.fhirClient.patient.id))
            app.use("/fhir", router);
            const { response } = await launchApp(app, { launchUri: "/fhir/my-launch" });
            const patientId = await response.text()
            expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
        })

        it ("app.use(SMART({ launchUri: './my-launch' }))", async () => {
            const app = express()
            app.use(session({ secret: "my secret", resave: false, saveUninitialized: false }));
            const router = express.Router({ mergeParams: true });
            router.use(SMART({
                clientId: "clientId1", 
                launchUri: "./my-launch"
            }))
            router.get("/", (req, res) => res.end(req.fhirClient.patient.id))
            app.use("/fhir", router);
            const { response } = await launchApp(app, { launchUri: "/fhir/my-launch" });
            const patientId = await response.text()
            expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
        })
    
        it ("app.use(SMART({ launchUri: '/fhir/my-launch' }))", async () => {
            const app = express()
            app.use(session({ secret: "my secret", resave: false, saveUninitialized: false }));
            const router = express.Router({ mergeParams: true });
            router.use(SMART({
                clientId: "clientId1", 
                launchUri: "/fhir/my-launch"
            }))
            router.get("/", (req, res) => res.end(req.fhirClient.patient.id))
            app.use("/fhir", router);
            const { response } = await launchApp(app, { launchUri: "/fhir/my-launch" });
            const patientId = await response.text()
            expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
        })
    
        it ("app.use(SMART({ launchUri: 'http://.../fhir/my-launch' }))", async () => {
            const app = express()
            app.use(session({ secret: "my secret", resave: false, saveUninitialized: false }));
            const router = express.Router({ mergeParams: true });
            router.use(SMART({
                clientId: "clientId1", 
                launchUri: `http://127.0.0.1:${APP_SERVER_PORT}/fhir/my-launch`
            }))
            router.get("/", (req, res) => res.end(req.fhirClient.patient.id))
            app.use("/fhir", router);
            const { response } = await launchApp(app, { launchUri: `http://127.0.0.1:${APP_SERVER_PORT}/fhir/my-launch` });
            const patientId = await response.text()
            expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
        })
    })

    describe("with multiple configurations", () => {
        it ("app.use(SMART([cfg, cfg, ...]))", async () => {
            const app = express()
            app.use(session({ secret: "my secret", resave: false, saveUninitialized: false }));
            app.use(SMART([
                { clientId: "clientId1", issMatch: () => false },
                { clientId: "clientId2", issMatch: () => true  }
            ]))
            app.get("/", (req, res) => res.end(req.fhirClient.state.clientId))
            const { response } = await launchApp(app, { launchUri: "/launch" });
            const clientId = await response.text()
            expect(clientId).to.equal("clientId2")
        });

        it ("app.use(SMART([{ launchUri: 'my-launch' }, ...]))", async () => {
            const app = express()
            app.use(session({ secret: "my secret", resave: false, saveUninitialized: false }));
            app.use(SMART([
                { clientId: "clientId1", issMatch: () => false },
                { clientId: "clientId2", issMatch: () => true, launchUri: 'my-launch'  }
            ]))
            app.get("/", (req, res) => res.end(req.fhirClient.state.clientId))
            const { response } = await launchApp(app, { launchUri: "/my-launch" });
            const clientId = await response.text()
            expect(clientId).to.equal("clientId2")
        })

        it ("app.use(SMART([{ launchUri: '/my-launch' }, ...]))", async () => {
            const app = express()
            app.use(session({ secret: "my secret", resave: false, saveUninitialized: false }));
            app.use(SMART([
                { clientId: "clientId1", issMatch: () => false },
                { clientId: "clientId2", issMatch: () => true, launchUri: '/my-launch'  }
            ]))
            app.get("/", (req, res) => res.end(req.fhirClient.state.clientId))
            const { response } = await launchApp(app, { launchUri: "/my-launch" });
            const clientId = await response.text()
            expect(clientId).to.equal("clientId2")
        })

        it ("app.use(SMART([{ launchUri: './my-launch' }, ...]))", async () => {
            const app = express()
            app.use(session({ secret: "my secret", resave: false, saveUninitialized: false }));
            app.use(SMART([
                { clientId: "clientId1", issMatch: () => false },
                { clientId: "clientId2", issMatch: () => true, launchUri: './my-launch'  }
            ]))
            app.get("/", (req, res) => res.end(req.fhirClient.state.clientId))
            const { response } = await launchApp(app, { launchUri: "/my-launch" });
            const clientId = await response.text()
            expect(clientId).to.equal("clientId2")
        })

        it ("app.use(SMART([{ multiple: true }, ...]))", async () => {
            const app = express()
            app.use(session({ secret: "my secret", resave: false, saveUninitialized: false }));
            app.use(SMART([ 
                { clientId: "clientId1", issMatch: () => false },
                { clientId: "clientId2", issMatch: () => true, multiple: true }
            ]))
            app.get("/", (req, res) => res.end(req.fhirClient.state.clientId))
            const { response } = await launchApp(app, { launchUri: "/launch" });
            const clientId = await response.text()
            expect(clientId).to.equal("clientId2")
            expect(response.url).to.match(/\?state=[a-zA-Z0-9]+/)
        })

        it ("app.use(SMART([{ fhirServiceUrl: 'http://...' }, ...]))", async () => {
            const app = express()
            app.use(session({ secret: "my secret", resave: false, saveUninitialized: false }));
            app.use(SMART([
                { clientId: "clientId1", issMatch: () => false },
                { clientId: "clientId2", issMatch: () => true, fhirServiceUrl: FHIR_SERVER_URL }
            ]))
            app.get("/", (req, res) => res.end(req.fhirClient.state.clientId))
            const { response } = await launchApp(app, {
                launchUri: `http://127.0.0.1:${APP_SERVER_PORT}/launch?fhirServiceUrl=${encodeURIComponent(FHIR_SERVER_URL)}`
            });
            const clientId = await response.text()
            expect(clientId).to.equal("clientId2")
        })
    })

    it.skip ("code flow in router", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        const router = express.Router({ mergeParams: true });
        app.use("/fhir", router);
        router.use(SMART({
            clientId: "clientId1", 
            // launchUri: "/fhir/launch",
            redirectUri: "/app"
        }))
        router.get("/app", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app, { launchUri: "/fhir/launch" });
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
        
    });

    it ("code flow with multiple configs and multiple=true", async () => {
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        app.use(SMART([
            { clientId: "clientId1", multiple: true, issMatch: () => false },
            { clientId: "clientId2", multiple: true, issMatch: () => true  }
        ]))
        app.get("/", (req, res) => res.end(req.fhirClient.patient.id))

        const { response } = await launchApp(app);
        const patientId = await response.text()
        expect(patientId).to.equal(ACCESS_TOKEN_RESPONSE.patient)
        
    });

    it ("refresh an authorized page", async () => {

        // Create a server to test with ---------------------------------------
        const app = express()
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        app.use(SMART({ clientId: "whatever" }))
        app.get("/", (req, res) => res.end(req.fhirClient.patient.id))
        
        const { response, cookie } = await launchApp(app);

        const response2 = await fetch(response.url, {
            credentials: "include",
            mode       : "navigate",
            headers    : { cookie }
        })

        expect(await response2.text()).to.equal(ACCESS_TOKEN_RESPONSE.patient)
    });

    it("can bypass oauth by passing `fhirServiceUrl`", async () => {
        const app = express()
        
        app.use(session({
            secret: "my secret",
            resave: false,
            saveUninitialized: false
        }));
        
        app.use(SMART({ clientId: "whatever" }))
        
        app.get("/", (req, res) => req.fhirClient.request("Patient").then(pt => res.json(pt)))

        const { address, server } = await startServer(app);
        appServer = server;

        nock(FHIR_SERVER_URL).get("/Patient").reply(200, { resourceType: "Patient" })

        const res1 = await fetch(`${address}/launch?fhirServiceUrl=${encodeURIComponent(FHIR_SERVER_URL)}`, {
            redirect   : "manual",
            credentials: "include",
            mode       : "navigate"
        })
        
        const cookieHeader = res1.headers.get("set-cookie")
        const location = res1.headers.get("location")
        assert(cookieHeader, "No cookie returned by the launch call")
        assert(location, "Did not redirect")

        const res2 = await fetch(location, {
            credentials: "include",
            headers: {
                cookie: cookieHeader.replace(/;.+$/, "")
            }
        })

        expect(await res2.json()).to.equal({ resourceType: "Patient" })
    });

    // it.skip ("appends 'launch' to the scopes if needed", async () => {
    //     const req     = new HttpRequest("http://localhost/launch");
    //     const res     = new HttpResponse();
    //     const storage = new MemoryStorage();
    //     const smart   = FHIR(req as any, res as any, storage);
    //     await smart.authorize({
    //         fhirServiceUrl: "http://localhost",
    //         scope: "x",
    //         launch: "123"
    //     });
    //     expect(res.status).to.equal(302);
    //     expect(res.headers.location).to.exist();
    //     const url = new URL(res.headers.location);
    //     const state = url.searchParams.get("state");
    //     const stored = await storage.get(state + "");
    //     expect(stored.scope).to.equal("x launch");
    // });

    // it ("can do standalone launch");
});

describe("ServerStorage", () => {
    it ("can 'get'", async () => {
        const session = { a: "b" };
        const storage = new ServerStorage({ session } as any);
        expect(await storage.get("a")).to.equal("b");
        expect(await storage.get("b")).to.equal(undefined);
    });
    it ("can 'set'", async () => {
        const session = {};
        const storage = new ServerStorage({ session } as any);
        await storage.set("a", "b");
        expect(await storage.get("a")).to.equal("b");
    });
    it ("can 'unset'", async () => {
        const session = { a: "b" };
        const storage = new ServerStorage({ session } as any);
        const result = await storage.unset("a");
        expect(result).to.equal(true);
        expect(session.a).to.be.undefined();
        const result2 = await storage.unset("a");
        expect(result2).to.equal(false);
    });
});

describe("NodeAdapter", () => {

    it ("getUrl", () => {
        const map = [
            {
                request: {
                    url: "/",
                    headers: {
                        host: "localhost"
                    }
                },
                result: "http://localhost/"
            },
            {
                request: {
                    url: "/a/b/c",
                    headers: {
                        "x-forwarded-host" : "external-domain",
                        "x-forwarded-proto": "https"
                    }
                },
                result: "https://external-domain/a/b/c"
            },
            {
                request: {
                    headers: {
                        "x-forwarded-host" : "external-domain",
                        "x-forwarded-proto": "https",
                        "x-forwarded-port" : "8080",
                        "x-original-uri"   : "/b/c/d"
                    }
                },
                result: "https://external-domain:8080/b/c/d"
            }
        ];

        map.forEach(meta => {
            const request = meta.request as IncomingMessage;
            request.socket = {} as any;
            const adapter = new Adapter({ request, response: {} as any });
            expect(adapter.getUrl().href).to.equal(meta.result);
        });
    });

    it ("getStorage() works with factory function", () => {

        const callLog: any[] = [];

        const fakeStorage: any = { fakeStorage: "whatever" };

        function getStorage(...args) {
            callLog.push(args);
            return fakeStorage;
        }

        const adapter = new Adapter({
            storage : getStorage,
            request : "my-request" as any,
            response: "my-response" as any
        });

        // Call it twice and make sure that only one instance is created
        expect(adapter.getStorage()).to.equal(fakeStorage);
        expect(adapter.getStorage()).to.equal(fakeStorage);
        expect(callLog).to.equal([[{
            storage : getStorage,
            request : "my-request",
            response: "my-response"
        }]]);
    });
});
