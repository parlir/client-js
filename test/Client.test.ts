import { expect }          from "@hapi/code"
import * as Lab            from "@hapi/lab"
import * as FS             from "fs"
import { fetch }           from "cross-fetch"
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill"
import mockDebug           from "./mocks/mockDebug"
import mockServer          from "./mocks/mockServer"
import { Client, msg }     from "../src/lib/Client"
import { KEY }             from "../src/lib/smart"
import { fhirclient }      from "../src/types"
import { btoa }            from "../src/lib"
import MemoryStorage       from "./mocks/MemoryStorage"
import MockWindow          from "./mocks/Window"
import Console             from "./mocks/Console"


const nativeFhir = require("../lib/nativeFhir")

export const lab = Lab.script();
const { it, describe, before, after, afterEach, beforeEach } = lab;

const clientDebug = mockDebug.instances.find(instance => instance.namespace === "FHIR:client");

let mockDataServer: any, mockUrl: string;

const originalConsole = console;

before(() => {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        mockDataServer = mockServer.listen(null, "0.0.0.0", (error: Error) => {
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
        return new Promise((resolve, reject) => {
            mockUrl = "";
            delete (global as any).fetch;
            mockDataServer.close((error: Error) => {
                if (error) {
                    reject(new Error("Error shutting down the mock-data server: " + error));
                }
                // console.log("Mock Data Server CLOSED!");
                resolve(void 0);
            });
        });
    }
});

beforeEach(() => {
    // @ts-ignore
    global.console = new Console();
})

afterEach(() => {
    global.console = originalConsole;
    mockServer.clear();
    clientDebug._calls.length = 0;
    delete (global as any).sessionStorage;
});

describe("FHIR.client", () => {

    describe ("constructor", () => {
        it ("throws if initialized without arguments", () => {
            // @ts-ignore
            expect(() => new Client()).to.throw();
        });

        it ("throws if initialized without serverUrl", () => {
            // @ts-ignore
            expect(() => new Client({})).to.throw();
        });

        it ("throws if initialized with invalid serverUrl", () => {
            // @ts-ignore
            expect(() => new Client("invalid-url")).to.throw();
        });

        it ("accepts string as argument", () => {
            // @ts-ignore
            expect(new Client("http://test").state).to.equal({ serverUrl: "http://test" });
        });

        it ("Checks scopes in constructor", () => {
            new Client({ serverUrl: "http://x", scope: "a b c", tokenResponse: { scope: "b" }})
            // @ts-ignore
            expect((console as Console).entries).to.equal([
                ["warn", [msg.rejectedScopes, 'a", "c']]
            ])
        })
    });

    describe ("patient.read", () => {

        it ("rejects with no patient", () => {
            const client = new Client({ serverUrl: mockUrl, tokenResponse: {} });
            expect(client.patient.read()).to.reject("Patient is not available");
        });

        it ("can be aborted", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            mockServer.mock({
                body: {
                    resourceType: "Patient",
                    id: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                },
                _delay: 10
            });

            const abortController = new AbortController();
            const task = client.patient.read({ signal: abortController.signal });
            abortController.abort();
            return expect(task).to.reject("The user aborted a request.");
        });

        it ("works as expected", async () => {
            const mock = {
                headers: { "content-type": "application/json" },
                status: 200,
                body: {
                    resourceType: "Patient",
                    id: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            };

            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });
            mockServer.mock(mock);
            const result = await client.patient.read();
            expect(result).to.include(mock.body as any);
        });

        it ("works with includeResponse: true", async () => {
            const mock = {
                headers: { "content-type": "application/json" },
                status: 200,
                body: {
                    resourceType: "Patient",
                    id: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            };

            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            mockServer.mock(mock);
            const result = await client.patient.read({ includeResponse: true });
            expect(result.body).to.include(mock.body as any);
            expect(result.response.status).to.equal(200);
        });

    });

    describe ("patient.request", () => {

        it ("rejects with no patient", () => {
            const client = new Client({ serverUrl: mockUrl, tokenResponse: {}});
            expect(client.patient.request("Observation")).to.reject("Patient is not available");
        });

        it ("throws on incorrect path", () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });
            expect(client.patient.request("/")).to.reject(`Invalid url "${mockUrl + "/"}"`);
        });

        it ("rejects for not supported resource types", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            // Mock the conformance statement
            mockServer.mock({ body: {} });

            return expect(client.patient.request("Observation")).to.reject(
                "Resource \"Observation\" is not supported by this FHIR server"
            );
        });

        it ("rejects if a search param cannot be determined", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            // Mock the conformance statement
            mockServer.mock({
                body: {
                    rest: [{
                        resource: [{
                            type: "Observation"
                        }]
                    }]
                }
            });

            return expect(client.patient.request("Observation")).to.reject(
                "No search parameters supported for \"Observation\" on this FHIR server"
            );
        });

        it ("rejects if a resource is not in the patient compartment", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            // Mock the conformance statement
            mockServer.mock({
                body: {
                    rest: [{
                        resource: [{
                            type: "Test"
                        }]
                    }]
                }
            });

            return expect(client.patient.request("Test")).to.reject(
                "Cannot filter \"Test\" resources by patient"
            );
        });

        it ("works as expected with a string URL", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            // Mock the conformance statement
            mockServer.mock({
                body: {
                    rest: [{
                        resource: [{
                            type: "Observation",
                            searchParam: [
                                { name: "patient" }
                            ]
                        }]
                    }]
                }
            });

            mockServer.mock({
                body: {
                    resourceType: "Observation",
                    id: "whatever"
                }
            });

            await client.patient.request("Observation");
        });

        it ("works as expected with URL instance", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            // Mock the conformance statement
            mockServer.mock({
                body: {
                    rest: [{
                        resource: [{
                            type: "Observation",
                            searchParam: [
                                { name: "patient" }
                            ]
                        }]
                    }]
                }
            });

            mockServer.mock({
                body: {
                    resourceType: "Observation",
                    id: "whatever"
                }
            });

            await client.patient.request(new URL("Observation", mockUrl));
        });

        it ("works as expected with request options", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            // Mock the conformance statement
            mockServer.mock({
                body: {
                    rest: [{
                        resource: [{
                            type: "Observation",
                            searchParam: [
                                { name: "patient" }
                            ]
                        }]
                    }]
                }
            });

            mockServer.mock({
                body: {
                    resourceType: "Observation",
                    id: "whatever"
                }
            });

            await client.patient.request({ url: "Observation" });
        });

        it ("can be aborted", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            // Mock the conformance statement
            mockServer.mock({
                body: {
                    rest: [{
                        resource: [{
                            type: "Observation",
                            searchParam: [
                                { name: "patient" }
                            ]
                        }]
                    }]
                },
                _delay: 10
            });

            mockServer.mock({
                body: {
                    resourceType: "Observation",
                    id: "whatever"
                },
                _delay: 10
            });

            const abortController = new AbortController();
            const task = client.patient.request({ url: "Observation", signal: abortController.signal });
            abortController.abort();
            return expect(task).to.reject("The user aborted a request.");
        });

        it ("works if the resource is Patient and _id param is supported", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            // Mock the conformance statement
            mockServer.mock({
                body: {
                    rest: [{
                        resource: [{
                            type: "Patient",
                            searchParam: [
                                { name: "_id" }
                            ]
                        }]
                    }]
                }
            });

            mockServer.mock({
                body: {
                    resourceType: "Patient",
                    id: "whatever"
                }
            });

            await client.patient.request("Patient");
        });

        it ("rejects if the resource is Patient and _id param is not supported", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            // Mock the conformance statement
            mockServer.mock({
                body: {
                    rest: [{
                        resource: [{
                            type: "Patient",
                            searchParam: []
                        }]
                    }]
                }
            });

            mockServer.mock({
                body: {
                    resourceType: "Patient",
                    id: "whatever"
                }
            });

            return expect(client.patient.request("Patient")).to.reject();
        });

        it ("works as expected with includeResponse: true", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "2e27c71e-30c8-4ceb-8c1c-5641e066c0a4"
                }
            });

            // Mock the conformance statement
            mockServer.mock({
                body: {
                    rest: [{
                        resource: [{
                            type: "Observation",
                            searchParam: [
                                { name: "patient" }
                            ]
                        }]
                    }]
                }
            });

            mockServer.mock({
                body: {
                    resourceType: "Observation",
                    id: "whatever"
                }
            });

            const result = await client.patient.request<fhirclient.JsonObject>({
                url: "Observation",
                includeResponse: true
            });
            expect(result.body).to.include({ resourceType: "Observation", id: "whatever" });
            expect(result.response.status).to.equal(200);
        });
    });

    describe ("encounter.read", () => {
        it ("rejects with no encounter", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {}
            });
            expect(client.encounter.read()).to.reject("Encounter is not available");

            mockServer.mock({ body: { resourceType: "Encounter", id: "encounter-id" }});
            (client.state.tokenResponse as any).encounter = "whatever";
            const encounter = await client.encounter.read();
            expect(encounter).to.equal({ resourceType: "Encounter", id: "encounter-id" });
        });

        it ("can be aborted", () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    encounter: "x"
                }
            });

            mockServer.mock({
                body: { id: "encounter-id" },
                _delay: 10
            });

            const abortController = new AbortController();
            const task = client.encounter.read({ signal: abortController.signal });
            abortController.abort();
            expect(task).to.reject("The user aborted a request.");
        });

        it ("works with includeResponse: true", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    encounter: "x"
                }
            });
            mockServer.mock({ body: { resourceType: "Encounter", id: "encounter-id" }});
            const result = await client.encounter.read({ includeResponse: true });
            expect(result.body).to.equal({ resourceType: "Encounter", id: "encounter-id" });
            expect(result.response.status).to.equal(200);
        });
    });

    describe ("user.read", () => {

        const id_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9." +
        "eyJwcm9maWxlIjoiUHJhY3RpdGlvbmVyL3NtYXJ0LVByYWN0aXRpb2" +
        "5lci03MjA4MDQxNiIsImZoaXJVc2VyIjoiUHJhY3RpdGlvbmVyL3Nt" +
        "YXJ0LVByYWN0aXRpb25lci03MjA4MDQxNiIsInN1YiI6IjM2YTEwYm" +
        "M0ZDJhNzM1OGI0YWZkYWFhZjlhZjMyYmFjY2FjYmFhYmQxMDkxYmQ0" +
        "YTgwMjg0MmFkNWNhZGQxNzgiLCJpc3MiOiJodHRwOi8vbGF1bmNoLn" +
        "NtYXJ0aGVhbHRoaXQub3JnIiwiaWF0IjoxNTU5MzkyMjk1LCJleHAi" +
        "OjE1NTkzOTU4OTV9.niEs55G4AFJZtU_b9Y1Y6DQmXurUZZkh3WCud" +
        "ZgwvYasxVU8x3gJiX3jqONttqPhkh7418EFssCKnnaBlUDwsbhp7xd" +
        "WN4o1L1NvH4bp_R_zJ25F1s6jLmNm2Qp9LqU133PEdcRIqQPgBMyZB" +
        "WUTyxQ9ihKY1RAjlztAULQ3wKea-rfe0BXJZeUJBsQPzYCnbKY1dON" +
        "_NRd8N9pTImqf41MpIbEe7YEOHuirIb6HBpurhAHjTLDv1IuHpEAOx" +
        "pmtxVVHiVf-FYXzTFmn4cGe2PsNJfBl8R_zow2n6qaSANdvSxJDE4D" +
        "UgIJ6H18wiSJJHp6Plf_bapccAwxbx-zZCw";

        it ("rejects with no user", async () => {
            const client = new Client({ serverUrl: mockUrl, tokenResponse: {}});
            expect(client.user.read()).to.reject("User is not available");
            mockServer.mock({ body: { resourceType: "Patient", id: "user-id" }});
            (client.state.tokenResponse as any).id_token = id_token;
            const user = await client.user.read();
            expect(user).to.equal({ resourceType: "Patient", id: "user-id" });
        });

        it ("can be aborted", () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    id_token
                }
            });
            mockServer.mock({
                body: { id: "user-id" },
                _delay: 10
            });

            const abortController = new AbortController();
            const task = client.user.read({ signal: abortController.signal });
            abortController.abort();
            expect(task).to.reject("The user aborted a request.");
        });

        it ("works with includeResponse: true", async () => {
            const mock = {
                body: { resourceType: "Patient", id: "user-id" },
                _delay: 10
            };

            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    patient: "whatever",
                    id_token
                }
            });

            mockServer.mock(mock);
            const result = await client.user.read({ includeResponse: true });
            expect(result.body).to.equal({ resourceType: "Patient", id: "user-id" });
            expect(result.response.status).to.equal(200);
        });
    });

    describe ("fhir.js api", { timeout: 5000 }, () => {
        it ("does not work without fhir.js", async () => {
            const client = new Client({
                serverUrl: "https://r2.smarthealthit.org",
                tokenResponse: {
                    patient: "bd7cb541-732b-4e39-ab49-ae507aa49326"
                }
            });
            expect(client.api).to.be.undefined();
            expect(client.patient.api).to.be.undefined();
        });

        describe ("browser tests", () => {
            beforeEach(() => {
                (global as any).window = {
                    fhir: nativeFhir,
                    btoa,
                    fetch

                };
                (global as any).fetch = fetch
            });

            afterEach(() => {
                delete (global as any).window
                delete (global as any).fetch
            });

            it ("works in the browser", async () => {
                const client = new Client({
                    serverUrl: "https://r2.smarthealthit.org",
                    tokenResponse: {
                        patient: "bd7cb541-732b-4e39-ab49-ae507aa49326"
                    }
                });
                await (client.api as any).read({ type: "Patient", id: "bd7cb541-732b-4e39-ab49-ae507aa49326" });
                await (client.api as any).search({ type: "Patient" });
                await (client.patient.api as any).read({ type: "Patient", id: "bd7cb541-732b-4e39-ab49-ae507aa49326" });
            });
        })
    });

    it ("client.connect", () => {
        const client = new Client({
            serverUrl: "https://r2.smarthealthit.org",
            tokenResponse: {
                access_token: "my access token"
            }
        });

        let _passedOptions: any = {};

        const fhirJs = (options: any) => {
            _passedOptions = options;
            return options;
        };

        client.connect(fhirJs);

        expect(_passedOptions.baseUrl).to.equal("https://r2.smarthealthit.org");
        expect(_passedOptions.auth).to.equal({ token: "my access token" });

        (client.state.tokenResponse as any).access_token = null;
        client.connect(fhirJs);
        expect(_passedOptions.auth).to.be.undefined();
        expect(client.patient.api).to.be.undefined();

        client.state.username = "my username";
        client.connect(fhirJs);
        expect(_passedOptions.auth).to.be.undefined();

        client.state.password = "my password";
        client.connect(fhirJs);
        expect(_passedOptions.auth).to.equal({
            user: "my username",
            pass: "my password"
        });

        client.state.password = "my password";
        client.connect(fhirJs);
        expect(_passedOptions.auth).to.equal({
            user: "my username",
            pass: "my password"
        });

        (client.state.tokenResponse as any).patient = "bd7cb541-732b-4e39-ab49-ae507aa49326";
        client.connect(fhirJs);
        expect(client.patient.api).to.not.be.undefined();
    });

    describe ("client.request", () => {

        // Argument validation -------------------------------------------------
        it ("rejects if no url is provided", async () => {
            const client = new Client("http://localhost");
            // @ts-ignore
            expect(client.request()).to.reject();
        });

        // Token expiration and refresh ----------------------------------------

        it ("rejects if 401 and no accessToken", async () => {
            const client = new Client(mockUrl);
            mockServer.mock({ status: 401 });
            return expect(client.request("Patient")).to.reject();
        });

        it ("throws if 401 and no fhirOptions.useRefreshToken", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    access_token: "whatever"
                }
            });
            mockServer.mock({ status: 401, body: "" });
            return expect(client.request("Patient", { useRefreshToken: false })).to.reject();
        });

        it ("throws if 401 and no refresh_token", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    access_token: "whatever"
                }
            });
            mockServer.mock({ status: 401 });
            return expect(client.request("Patient")).to.reject();
        });

        it ("throws if 401 after refresh", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenResponse: {
                    access_token: "whatever",
                    refresh_token: "whatever"
                }
            });
            mockServer.mock({ status: 401 });
            return expect(client.request("Patient")).to.reject();
        });

        it ("throws if 403 after refresh", async () => {
            const client = new Client(mockUrl);
            mockServer.mock({ status: 403 });
            return expect(client.request("/")).to.reject();
        });

        it ("auto-refresh if access token is expired", async () => {
            const exp = Math.round(Date.now() / 1000) - 20;
            const access_token = `x.${btoa(`{"exp":${exp}}`)}.x`;
            const client = new Client({
                serverUrl: mockUrl,
                tokenUri: mockUrl,
                expiresAt: exp,
                tokenResponse: {
                    access_token,
                    refresh_token: "whatever",
                    scope: "offline_access"
                }
            });
            mockServer.mock({ body: { access_token: "x" }});
            mockServer.mock({
                handler(req, res) {
                    res.json(req.headers.authorization)
                }
            });
            const result = await client.request("/");
            expect(client.state.tokenResponse?.access_token).to.equal("x");
            expect(result).to.equal("Bearer x");
        });

        it ("auto-refresh if access token is about to expire", async () => {
            const exp = Math.round(Date.now() / 1000) - 5;
            const access_token = `x.${btoa(`{"exp":${exp}}`)}.x`;
            const client = new Client({
                serverUrl: mockUrl,
                tokenUri: mockUrl,
                expiresAt: exp,
                tokenResponse: {
                    access_token,
                    refresh_token: "whatever",
                    scope: "offline_access"
                }
            });
            mockServer.mock({ body: { access_token: "x" }});
            mockServer.mock({ status: 200, body: "OK" });
            const result = await client.request("/");
            expect(result).to.equal("OK");
            expect(client.state.tokenResponse?.access_token).to.equal("x");
        });

        it ("no auto-refresh if the access token is not expired", async () => {
            const exp = Math.round(Date.now() / 1000) + 50;
            const access_token = `x.${btoa(`{"exp":${exp}}`)}.x`;
            const client = new Client({
                serverUrl: mockUrl,
                tokenUri: mockUrl,
                expiresAt: exp,
                tokenResponse: {
                    access_token,
                    refresh_token: "whatever",
                    scope: "offline_access"
                }
            });
            mockServer.mock({ status: 200, body: "OK" });
            const result = await client.request("/");
            expect(result).to.equal("OK");
        });

        // ---------------------------------------------------------------------

        it ("can fetch single resource", async () => {
            const mock = { body: { id: "patient-id" }};
            const client = new Client({ serverUrl: mockUrl });
            mockServer.mock(mock);
            const result = await client.request("/Patient/patient-id");
            expect(result).to.include(mock.body);
        });

        it ("works with URL", async () => {
            const mock = { body: { id: "patient-id" }};
            const client = new Client({ serverUrl: mockUrl });
            mockServer.mock(mock);
            const result = await client.request(new URL("/Patient/patient-id", mockUrl));
            expect(result).to.include(mock.body);
        });

        it ("resolves with falsy value if one is received", async () => {
            const mock = { body: "" };
            const client = new Client({ serverUrl: mockUrl });
            mockServer.mock(mock);
            const result = await client.request("Patient");
            expect(result).to.equal("");
        });

        it ("ignores pageLimit if the result is not a bundle", async () => {
            const mock = { body: { resourceType: "Patient" }};
            const client = new Client({ serverUrl: mockUrl });
            mockServer.mock(mock);
            const result = await client.request("/Patient", { pageLimit: 1 });
            expect(result).to.include({ resourceType: "Patient" });
        });

        it ("can fetch a bundle", async () => {
            const mock = { body: { resourceType: "Bundle", entry: [] }};
            const client = new Client({ serverUrl: mockUrl });
            mockServer.mock(mock);
            const result = await client.request("/Patient");
            expect(result).to.include({ resourceType: "Bundle" });
            expect(result).to.include("entry");
        });

        it ("does not return an array if pageLimit is 1", async () => {
            const client = new Client({ serverUrl: mockUrl });
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: []
                }
            });
            const result = await client.request("/Patient", { pageLimit: 1 });
            expect(result).to.include({ resourceType: "Bundle" });
            expect(result).to.include("entry");
        });

        it ("can fetch multiple pages", async () => {
            const client = new Client({ serverUrl: mockUrl });
            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: [],
                    link: [{ relation: "next", url: "whatever" }]
                }
            });

            // Page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: []
                }
            });
            const result = await client.request("/Patient", { pageLimit: 2 });
            expect(result).to.be.an.array();
            expect(result.length).to.equal(2);
            expect(result[0]).to.include({ resourceType: "Bundle" });
            expect(result[0]).to.include("entry");
            expect(result[1]).to.include({ resourceType: "Bundle" });
            expect(result[1]).to.include("entry");
        });

        it ("returns an array if pageLimit is different than 1, even if there is only one page", async () => {
            const client = new Client({ serverUrl: mockUrl });
            mockServer.mock({ body: { resourceType: "Bundle", entry: [] }});
            const result = await client.request("/Practitioner", { pageLimit: 0 });
            expect(result).to.be.an.array();
            expect(result.length).to.equal(1);
            expect(result[0]).to.include({ resourceType: "Bundle" });
            expect(result[0]).to.include("entry");
        });

        it ("can fetch all pages", async () => {
            const client = new Client({ serverUrl: mockUrl });

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: [],
                    link: [{ relation: "next", url: "whatever" }]
                }
            });

            // Page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: []
                }
            });

            const result = await client.request("/Patient", { pageLimit: 0 });
            expect(result).to.be.an.array();
            expect(result.length).to.equal(2);
        });

        it ("onPage callback", async () => {
            const client = new Client({ serverUrl: mockUrl });
            const pages: any[] = [];
            const onPage = (page: any) => pages.push(page);

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 1,
                    entry: [],
                    link: [{ relation: "next", url: "whatever" }]
                }
            });

            // Page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: []
                }
            });

            const result = await client.request("/Patient", {
                pageLimit: 0,
                onPage
            });
            expect(result, "Resolves with an object").to.equal(null);
            expect(pages.length, "onPage should be called twice").to.equal(2);
            expect(pages[0]).to.include({ pageId: 1 });
            expect(pages[1]).to.include({ pageId: 2 });
        });

        it ("stops fetching pages if onPage throws", async () => {
            const client = new Client({ serverUrl: mockUrl });
            const pages: any[] = [];
            const onPage = (page: any) => {
                pages.push(page);
                throw new Error("test error");
            };

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 1,
                    entry: [],
                    link: [{ relation: "next", url: "whatever" }]
                }
            });

            await client.request("/Patient", {
                pageLimit: 0,
                onPage
            }).catch(error => {
                expect(error).to.be.error(Error, "test error");
            });
            expect(pages.length, "onPage should be called once").to.equal(1);
            expect(pages[0]).to.include({ pageId: 1 });
        });

        it ("stops fetching pages if onPage rejects", async () => {
            const client = new Client({ serverUrl: mockUrl });
            const pages: any[] = [];
            const onPage = (page: any) => {
                pages.push(page);
                return Promise.reject(new Error("test error"));
            };

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 1,
                    entry: [],
                    link: [{ relation: "next", url: "whatever" }]
                }
            });

            await client.request("/Patient", {
                pageLimit: 0,
                onPage
            }).catch(error => {
                expect(error).to.be.error(Error, "test error");
            });
            expect(pages.length, "onPage should be called once").to.equal(1);
            expect(pages[0]).to.include({ pageId: 1 });
        });

        it ("awaits for the onPage callback", async () => {
            const client = new Client({ serverUrl: mockUrl });
            const pages: any[] = [];
            const onPage = (page: any) => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        pages.push(page);
                        resolve(void 0);
                    }, 100);
                });
            };

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 1,
                    entry: [],
                    link: [{ relation: "next", url: "whatever" }]
                }
            });

            // Page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: []
                }
            });

            const result = await client.request("/Patient", {
                pageLimit: 0,
                onPage
            });
            expect(result, "Resolves with an object").to.equal(null);
            expect(pages.length, "onPage should be called twice").to.equal(2);
            expect(pages[0]).to.include({ pageId: 1 });
            expect(pages[1]).to.include({ pageId: 2 });
        });

        it ("can resolve refs on single resource", async () => {
            const client = new Client({ serverUrl: mockUrl });

            // Main page
            mockServer.mock({
                body: {
                    resourceType: "Patient",
                    id: "id",
                    ref1: {
                        reference: "whatever"
                    }
                }
            });

            // Referenced page
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-id"
                }
            });

            const result = await client.request(
                "/Patient/id",
                { resolveReferences: "ref1" }
            );
            expect(result).to.equal({
                resourceType: "Patient",
                id: "id",
                ref1: {
                    resourceType: "Ref",
                    id: "Ref-id"
                }
            });
        });

        it ("does not fetch the same ref twice", async () => {
            const client = new Client(mockUrl);
            mockServer.mock({
                body: {
                    patient: { reference: "ref/1" },
                    subject: { reference: "ref/1" }
                }
            });
            mockServer.mock({
                body: { resourceType: "Patient" }
            });

            const result = await client.request("Observation/id", {
                resolveReferences: [ "patient", "subject" ]
            });

            expect(result).to.equal({
                patient: { resourceType: "Patient" },
                subject: { resourceType: "Patient" }
            });
        });

        it ("mixed example #88", async () => {
            const json = {
                contained: [
                    {
                        subject: {
                            reference: "Patient/1"
                        }
                    },
                    {
                        beneficiary: {
                            reference: "Patient/1"
                        }
                    }
                ],
                patient: {
                    reference: "Patient/1"
                }
            };

            const client = new Client(mockUrl);

            mockServer.mock({ body: json });

            mockServer.mock({ body: { resourceType: "Patient", id: 1 }});

            const result = await client.request(
                "ExplanationOfBenefit/17",
                {
                    resolveReferences: [
                        "patient",
                        "contained.0.subject",
                        "contained.1.beneficiary"
                    ],
                    graph: true
                }
            );

            expect(result.patient).to.equal({ resourceType: "Patient", id: 1 });
            expect(result.contained[0].subject).to.equal({ resourceType: "Patient", id: 1 });
            expect(result.contained[1].beneficiary).to.equal({ resourceType: "Patient", id: 1 });
        });

        it ("mixed example #73", async () => {
            const json = {
                identifier: [
                    {
                        assigner: {
                            reference: "Organization/2"
                        }
                    },
                    {
                        assigner: {
                            reference: "Organization/3"
                        }
                    }
                ]
            };

            const client = new Client(mockUrl);

            mockServer.mock({ body: json });

            mockServer.mock({ body: { resourceType: "Organization", id: 2 }});

            mockServer.mock({ body: { resourceType: "Organization", id: 3 }});

            const result = await client.request(
                "ExplanationOfBenefit/17",
                {
                    resolveReferences: "identifier..assigner",
                    graph: true
                }
            );

            expect(result.identifier).to.equal([
                {
                    assigner: {
                        resourceType: "Organization",
                        id: 2
                    }
                },
                {
                    assigner: {
                        resourceType: "Organization",
                        id: 3
                    }
                }
            ]);
        });

        it ("ignores missing ref", async () => {
            const client = new Client(mockUrl);

            mockServer.mock({ body: { patient: { reference: "ref/1" }}});

            mockServer.mock({ status: 404, body: "Not Found" });

            const result = await client.request("Observation/id", { resolveReferences: "patient" });

            expect(result).to.equal({ patient: { reference: "ref/1" }});
        });

        it ("ignores missing ref from source", async () => {
            const client = new Client(mockUrl);
            mockServer.mock({ body: { patient: { reference: null }}});
            const result = await client.request("Observation/id", { resolveReferences: "patient" });
            expect(result).to.equal({ patient: { reference: null }});
        });

        it ("warns about duplicate ref paths", async () => {
            const client = new Client(mockUrl);

            mockServer.mock({ body: { patient: { reference: "ref/1" }}});

            mockServer.mock({ body: { resourceType: "Patient" }});

            const result = await client.request("Observation/id", {
                resolveReferences: ["patient", "patient"]
            });

            expect(result).to.equal({ patient: { resourceType: "Patient" }});

            expect(clientDebug._calls.find((o: any) => o[0] === "Duplicated reference path \"%s\"")).to.exist();
        });

        it ("can resolve nested refs", async () => {
            const client = new Client(mockUrl);

            // This is how the user had defined the list, If it works properly,
            // the request function should resolve them in different order:
            // 1. subject and encounter (in parallel)
            // 2. encounter.serviceProvider
            const refsToResolve = [
                "subject",
                "encounter.serviceProvider",
                "encounter"
            ];

            // 1. Observation
            // this request should be sent first!
            mockServer.mock({
                body: {
                    resourceType: "Observation",
                    encounter: { reference: "encounter/1" },
                    subject: { reference: "subject/1" }
                }
            });

            // 2. Patient (Observation.subject)
            // this request should be sent second (even though it might
            // reply after #3)
            mockServer.mock({
                body: { resourceType: "Patient" }
            });

            // 3. Encounter
            // this request should be sent third (even though it might
            // reply before #2)
            mockServer.mock({
                body: {
                    resourceType: "Encounter",
                    serviceProvider: { reference: "Organization/1" }
                }
            });

            // 4. Organization (Encounter.serviceProvider)
            // this request should be sent AFTER we have handled the response
            // from #3!
            mockServer.mock({
                body: { resourceType: "Organization" }
            });

            const result = await client.request("Observation/id", {
                resolveReferences: refsToResolve
            });

            expect(result).to.equal({
                resourceType: "Observation",
                encounter: {
                    resourceType: "Encounter",
                    serviceProvider: {
                        resourceType: "Organization"
                    }
                },
                subject: {
                    resourceType: "Patient"
                }
            });
        });

        it ("can resolve refs on single resource with `graph: false`", async () => {
            const client = new Client(mockUrl);

            // Main page
            mockServer.mock({
                body: {
                    resourceType: "Patient",
                    id: "id",
                    ref1: {
                        reference: "whatever"
                    }
                }
            });

            // Referenced page
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-id"
                }
            });

            const result = await client.request(
                "/Patient/id",
                {
                    resolveReferences: "ref1",
                    graph: false
                }
            );
            expect(result).to.equal({
                data: {
                    resourceType: "Patient",
                    id: "id",
                    ref1: {
                        reference: "whatever"
                    }
                },
                references: {
                    whatever: {
                        resourceType: "Ref",
                        id: "Ref-id"
                    }
                }
            });
        });

        it ("can resolve refs on pages", async () => {
            const client = new Client(mockUrl);

            // Main page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 1,
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-1",
                            ref1: {
                                reference: "whatever-1"
                            }
                        }
                    }]
                }
            });

            // Referenced page 1
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-whatever-1"
                }
            });

            // Main page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-2",
                            ref1: {
                                reference: "whatever-2"
                            }
                        }
                    }]
                }
            });

            // Referenced page 2
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-whatever-2"
                }
            });

            const result = await client.request(
                "/Patient",
                {
                    resolveReferences: "ref1",
                    pageLimit: 0
                }
            );
            expect(result).to.equal([
                {
                    resourceType: "Bundle",
                    pageId: 1,
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-1",
                            ref1: {
                                resourceType: "Ref",
                                id: "Ref-whatever-1"
                            }
                        }
                    }]
                },
                {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-2",
                            ref1: {
                                resourceType: "Ref",
                                id: "Ref-whatever-2"
                            }
                        }
                    }]
                }
            ]);
        });

        it ("can resolve refs on pages with `graph: false`", async () => {
            const client = new Client(mockUrl);

            // Main page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 1,
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-1",
                            ref1: {
                                reference: "Ref-whatever-1"
                            }
                        }
                    }]
                }
            });

            // Referenced page 1
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-whatever-1"
                }
            });

            // Main page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-2",
                            ref1: {
                                reference: "Ref-whatever-2"
                            }
                        }
                    }]
                }
            });

            // Referenced page 2
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-whatever-2"
                }
            });

            const result = await client.request(
                "/Patient",
                {
                    resolveReferences: "ref1",
                    pageLimit: 0,
                    graph: false
                }
            );
            expect(result).to.equal({
                data: [
                    {
                        resourceType: "Bundle",
                        pageId: 1,
                        link: [{ relation: "next", url: "whatever" }],
                        entry: [{
                            resource: {
                                resourceType: "Patient",
                                id: "pt-1",
                                ref1: {
                                    reference: "Ref-whatever-1"
                                }
                            }
                        }]
                    },
                    {
                        resourceType: "Bundle",
                        pageId: 2,
                        entry: [{
                            resource: {
                                resourceType: "Patient",
                                id: "pt-2",
                                ref1: {
                                    reference: "Ref-whatever-2"
                                }
                            }
                        }]
                    }
                ],
                references: {
                    "Ref-whatever-1": {
                        resourceType: "Ref",
                        id: "Ref-whatever-1"
                    },
                    "Ref-whatever-2": {
                        resourceType: "Ref",
                        id: "Ref-whatever-2"
                    }
                }
            });
        });

        it ("can resolve refs on pages with `onPage`", async () => {
            const client = new Client(mockUrl);

            // Main page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 1,
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-1",
                            ref1: {
                                reference: "whatever-1"
                            }
                        }
                    }]
                }
            });

            // Referenced page 1
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-whatever-1"
                }
            });

            // Main page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-2",
                            ref1: {
                                reference: "whatever-2"
                            }
                        }
                    }]
                }
            });

            // Referenced page 2
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-whatever-2"
                }
            });

            const pages: any[] = [];
            const result = await client.request(
                "/Patient",
                {
                    resolveReferences: "ref1",
                    pageLimit: 0,
                    onPage(data) {
                        pages.push(data);
                    }
                }
            );
            expect(result).to.equal(null);
            expect(pages).to.equal([
                {
                    resourceType: "Bundle",
                    pageId: 1,
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-1",
                            ref1: {
                                resourceType: "Ref",
                                id: "Ref-whatever-1"
                            }
                        }
                    }]
                },
                {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-2",
                            ref1: {
                                resourceType: "Ref",
                                id: "Ref-whatever-2"
                            }
                        }
                    }]
                }
            ]);
        });

        it ("can resolve refs on pages with `onPage` and `graph: false`", async () => {
            const client = new Client(mockUrl);

            // Main page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 1,
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-1",
                            ref1: {
                                reference: "whatever-1"
                            }
                        }
                    }]
                }
            });

            // Referenced page 1
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-whatever-1"
                }
            });

            // Main page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-2",
                            ref1: {
                                reference: "whatever-2"
                            }
                        }
                    }]
                }
            });

            // Referenced page 2
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-whatever-2"
                }
            });

            const pages: any[] = [];
            const refs: any[] = [];
            const result = await client.request(
                "/Patient",
                {
                    resolveReferences: "ref1",
                    pageLimit: 0,
                    graph: false,
                    onPage(data, references) {
                        pages.push(data);
                        refs.push(references);
                    }
                }
            );
            expect(result).to.equal(null);
            expect(pages).to.equal([
                {
                    resourceType: "Bundle",
                    pageId: 1,
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-1",
                            ref1: {
                                reference: "whatever-1"
                            }
                        }
                    }]
                },
                {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-2",
                            ref1: {
                                reference: "whatever-2"
                            }
                        }
                    }]
                }
            ]);
            expect(refs).to.equal([
                {
                    "whatever-1": {
                        resourceType: "Ref",
                        id: "Ref-whatever-1"
                    }
                },
                {
                    "whatever-1": {
                        resourceType: "Ref",
                        id: "Ref-whatever-1"
                    },
                    "whatever-2": {
                        resourceType: "Ref",
                        id: "Ref-whatever-2"
                    }
                }
            ]);
        });

        it ("resolve all refs if it points to an array", async () => {
            const client = new Client(mockUrl);

            // Main page
            mockServer.mock({
                body: {
                    resourceType: "Patient",
                    id: "id",
                    ref1: [
                        { reference: "whatever-1" },
                        { reference: "whatever-2" }
                    ]
                }
            });

            // Referenced page 1
            mockServer.mock({
                body: { resourceType: "Ref", id: "Ref-id-1" }
            });

            // Referenced page 2
            mockServer.mock({
                body: { resourceType: "Ref", id: "Ref-id-2" }
            });

            const result = await client.request(
                "/Patient/id",
                { resolveReferences: "ref1" }
            );
            expect(result).to.equal({
                resourceType: "Patient",
                id: "id",
                ref1: [
                    { resourceType: "Ref", id: "Ref-id-1" },
                    { resourceType: "Ref", id: "Ref-id-2" }
                ]
            });
        });


        // flat ----------------------------------------------------------------

        it ("flat", async () => {
            const client = new Client(mockUrl);

            // Main page
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: [
                        { resource: "resource-1" },
                        { resource: "resource-2" }
                    ]
                }
            });

            const result = await client.request("/Patient/id", { flat: true });

            expect(result).to.equal([
                "resource-1",
                "resource-2"
            ]);
        });

        it ("flat on multiple pages", async () => {
            const client = new Client(mockUrl);

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [
                        { resource: "resource-1" },
                        { resource: "resource-2" }
                    ]
                }
            });

            // Page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: [
                        { resource: "resource-3" }
                    ]
                }
            });

            const result = await client.request("/Patient/id", {
                flat: true,
                pageLimit: 0
            });

            expect(result).to.equal([
                "resource-1",
                "resource-2",
                "resource-3"
            ]);
        });

        it ("flat on multiple pages with references and onPage", async () => {
            const client = new Client(mockUrl);

            const results: any[] = [];

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [
                        { resource: "resource-1" },
                        {
                            resource: {
                                subject: {
                                    reference: "Patient/1"
                                }
                            }
                        }
                    ]
                }
            });

            // Referenced page 1
            mockServer.mock({
                body: {
                    resourceType: "Patient",
                    id: "Patient-1"
                }
            });

            // Page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [
                        { resource: "resource-3" }
                    ]
                }
            });

            // Page 3
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: [
                        { resource: "resource-4" },
                        { resource: "resource-5" }
                    ]
                }
            });

            const result = await client.request("/Patient/id", {
                flat: true,
                pageLimit: 0,
                resolveReferences: "subject",
                onPage: data => results.push(data)
            });

            expect(result).to.equal(null);
            expect(results).to.equal([
                [
                    "resource-1",
                    {
                        subject: {
                            resourceType: "Patient",
                            id: "Patient-1"
                        }
                    }
                ],
                ["resource-3"],
                ["resource-4", "resource-5"]
            ]);

        });

        it ("flat on multiple pages with references and onPage and graph=false", async () => {
            const client = new Client(mockUrl);

            const results: any[] = [];
            const references = {};

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [
                        { resource: "resource-1" },
                        {
                            resource: {
                                subject: {
                                    reference: "Patient/1"
                                }
                            }
                        }
                    ]
                }
            });

            // Referenced page 1
            mockServer.mock({
                body: {
                    resourceType: "Patient",
                    id: "Patient-1"
                }
            });

            // Page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [
                        { resource: "resource-3" }
                    ]
                }
            });

            // Page 3
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: [
                        { resource: "resource-4" },
                        { resource: "resource-5" }
                    ]
                }
            });

            const result = await client.request("/Patient/id", {
                flat: true,
                pageLimit: 0,
                resolveReferences: "subject",
                graph: false,
                onPage: (data, refs) => {
                    results.push(data);
                    Object.assign(references, refs);
                }
            });

            expect(result).to.equal(null);
            expect(results).to.equal([
                [ "resource-1", {
                    subject: {
                        reference: "Patient/1"
                    }
                } ],
                [ "resource-3"               ],
                [ "resource-4", "resource-5" ]
            ]);
            expect(references).to.equal({
                "Patient/1": {
                    resourceType: "Patient",
                    id: "Patient-1"
                }
            });
        });

        it ("flat on multiple pages with references", async () => {
            const client = new Client(mockUrl);

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [
                        { resource: "resource-1" },
                        {
                            resource: {
                                subject: {
                                    reference: "Patient/1"
                                }
                            }
                        }
                    ]
                }
            });

            // Referenced page 1
            mockServer.mock({
                body: {
                    resourceType: "Patient",
                    id: "Patient-1"
                }
            });

            // Page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [
                        { resource: "resource-3" }
                    ]
                }
            });

            // Page 3 (this should be ignored because pageLimit is 2)
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: [
                        { resource: "resource-4" },
                        { resource: "resource-5" }
                    ]
                }
            });

            const result = await client.request("/Patient/id", {
                flat: true,
                pageLimit: 2,
                resolveReferences: "subject"
            });

            expect(result).to.equal([
                "resource-1",
                {
                    subject: {
                        resourceType: "Patient",
                        id: "Patient-1"
                    }
                },
                "resource-3"
            ]);
        });

        it ("flat on multiple pages with references and graph=false", async () => {
            const client = new Client(mockUrl);

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [
                        { resource: "resource-1" },
                        {
                            resource: {
                                subject: {
                                    reference: "Patient/1"
                                }
                            }
                        }
                    ]
                }
            });

            // Referenced page 1
            mockServer.mock({
                body: {
                    resourceType: "Patient",
                    id: "Patient-1"
                }
            });

            // Page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [
                        { resource: "resource-3" }
                    ]
                }
            });

            // Page 3 (this should be ignored because pageLimit is 2)
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: [
                        { resource: "resource-4" },
                        { resource: "resource-5" }
                    ]
                }
            });

            const result = await client.request("/Patient/id", {
                flat: true,
                pageLimit: 2,
                graph: false,
                resolveReferences: "subject"
            });

            expect(result).to.equal({
                data: [
                    "resource-1",
                    {
                        subject: {
                            reference: "Patient/1"
                        }
                    },
                    "resource-3"
                ],
                references: {
                    "Patient/1": {
                        resourceType: "Patient",
                        id: "Patient-1"
                    }
                }
            });
        });

        it ("can fetch text", async () => {
            const client = new Client(mockUrl);
            mockServer.mock({ body: "This is a text" });
            const result = await client.request("/");
            expect(result).to.equal("This is a text");
        });

        it ("can fetch binary", async () => {
            const client = new Client(mockUrl);
            const file   = FS.readFileSync(__dirname + "/mocks/json.png");
            const goal64 = file.toString("base64");

            mockServer.mock({
                headers: { "Content-Type": "image/png" },
                file: "json.png"
            });

            const result = await client.request("/");
            const buffer = await result.arrayBuffer();
            expect(Buffer.from(buffer).toString("base64")).to.equal(goal64);
        });

        // Aborting ------------------------------------------------------------
        it ("can be aborted", () => {
            const mock = { body: { id: "patient-id" }, _delay: 10 };
            const client = new Client({ serverUrl: mockUrl });
            mockServer.mock(mock);
            const abortController = new AbortController();
            const task = client.request({ url: "/Patient/patient-id", signal: abortController.signal });
            abortController.abort();
            expect(task).to.reject("The user aborted a request.");
        });

        it ("aborts nested page requests", async () => {
            const client = new Client({ serverUrl: mockUrl });
            const pages: any[] = [];
            const abortController = new AbortController();
            const onPage = (page: any) => {
                if (pages.push(page) == 2) {

                    // On the second call to onPage the main request is complete
                    // (the one that got page 1) and the first child request
                    // (the one that got page 2) is complete. At this point,
                    // even though the main request itself is complete, aborting
                    // it should propagate to any nested requests and cancel them.
                    // We should not get to page 3!
                    abortController.abort();
                }
            };

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 1,
                    entry: [],
                    link: [{ relation: "next", url: "whatever" }]
                },
                _delay: 10
            });

            // Page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: [],
                    link: [{ relation: "next", url: "whatever" }]
                },
                _delay: 10
            });

            // Page 3
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 3,
                    entry: []
                },
                _delay: 10
            });

            return client.request({
                url: "/Patient",
                signal: abortController.signal
            }, {
                pageLimit: 0,
                onPage
            }).then(
                () => { throw new Error("Should have failed") },
                (e) => {
                    expect(e).to.be.error("The user aborted a request.");
                    expect(pages.length, "onPage should be called twice").to.equal(2);
                    expect(pages[0]).to.include({ pageId: 1 });
                    expect(pages[1]).to.include({ pageId: 2 });
                }
            );
        });

        it ("aborts nested reference requests", async () => {
            const client = new Client(mockUrl);
            const abortController = new AbortController();

            // Page 1
            mockServer.mock({
                body: {
                    patient: { reference: "ref/1" },
                    subject: { reference: "ref/2" }
                },
                _delay: 10
            });

            // Page 2
            mockServer.mock({
                body: { resourceType: "Patient" },
                _delay: 10
            });

            // Page 3
            mockServer.mock({
                body: { resourceType: "Patient" },
                _delay: 1000
            });

            const task = client.request({
                url: "/Patient",
                signal: abortController.signal
                }, {
                resolveReferences: [
                    "patient",
                    "subject"
                ]
            });

            // After 30ms the main resource should be fetched and the patient
            // reference should be resolved. The subject reference should
            // still be pending because it takes 1000ms to reply. If we abort
            // at that point, we should get our client.request promise
            // rejected with abort error.
            setTimeout(() => abortController.abort(), 30);

            return task.then(
                () => { throw new Error("Should have failed") },
                (e) => {
                    expect(e).to.be.error("The user aborted a request.");
                }
            );
        });

        // includeResponse -----------------------------------------------------
        it ("can fetch single resource with includeResponse: true", async () => {
            const mock = { body: { id: "patient-id" }};
            const client = new Client({ serverUrl: mockUrl });
            mockServer.mock(mock);
            const result = await client.request<fhirclient.CombinedFetchResult>({
                url: "/Patient/patient-id",
                includeResponse: true
            });
            expect(result.body).to.include(mock.body);
            expect(result.response.status).to.equal(200);
        });

        it ("can fetch all pages with includeResponse: true", async () => {
            const client = new Client(mockUrl);

            // Page 1
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: [],
                    link: [{ relation: "next", url: "whatever" }]
                }
            });

            // Page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    entry: []
                }
            });

            const result = await client.request<fhirclient.CombinedFetchResult>({
                url: "/Patient",
                includeResponse: true
            }, { pageLimit: 0 });
            expect(result.body).to.be.an.array();
            expect(result.body?.length).to.equal(2);
            expect(result.response.status).to.equal(200);
        });

        it ("can resolve refs on pages with includeResponse: true", async () => {
            const client = new Client(mockUrl);

            // Main page 1
            mockServer.mock({
                headers: {
                    "content-type": "application/json",
                    "x-custom": "test"
                },
                body: {
                    resourceType: "Bundle",
                    pageId: 1,
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-1",
                            ref1: {
                                reference: "whatever-1"
                            }
                        }
                    }]
                }
            });

            // Referenced page 1
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-whatever-1"
                }
            });

            // Main page 2
            mockServer.mock({
                body: {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-2",
                            ref1: {
                                reference: "whatever-2"
                            }
                        }
                    }]
                }
            });

            // Referenced page 2
            mockServer.mock({
                body: {
                    resourceType: "Ref",
                    id: "Ref-whatever-2"
                }
            });

            const result = await client.request<fhirclient.CombinedFetchResult>(
                {
                    url: "/Patient",
                    includeResponse: true
                },
                {
                    resolveReferences: "ref1",
                    pageLimit: 0
                }
            );

            expect(result.response.status).to.equal(200);
            expect(result.response.headers.get("x-custom")).to.equal("test");
            expect(result.body).to.equal([
                {
                    resourceType: "Bundle",
                    pageId: 1,
                    link: [{ relation: "next", url: "whatever" }],
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-1",
                            ref1: {
                                resourceType: "Ref",
                                id: "Ref-whatever-1"
                            }
                        }
                    }]
                },
                {
                    resourceType: "Bundle",
                    pageId: 2,
                    entry: [{
                        resource: {
                            resourceType: "Patient",
                            id: "pt-2",
                            ref1: {
                                resourceType: "Ref",
                                id: "Ref-whatever-2"
                            }
                        }
                    }]
                }
            ]);
        });
    });

    it ("client.user", () => {
        const idToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJwcm9maWxlIjo" +
            "iUHJhY3RpdGlvbmVyL3NtYXJ0LVByYWN0aXRpb25lci03MjA4MDQxNiIsImZoaXJ" +
            "Vc2VyIjoiUHJhY3RpdGlvbmVyL3NtYXJ0LVByYWN0aXRpb25lci03MjA4MDQxNiI" +
            "sInN1YiI6IjM2YTEwYmM0ZDJhNzM1OGI0YWZkYWFhZjlhZjMyYmFjY2FjYmFhYmQ" +
            "xMDkxYmQ0YTgwMjg0MmFkNWNhZGQxNzgiLCJpc3MiOiJodHRwOi8vbGF1bmNoLnN" +
            "tYXJ0aGVhbHRoaXQub3JnIiwiaWF0IjoxNTU5MzkyMjk1LCJleHAiOjE1NTkzOTU" +
            "4OTV9.niEs55G4AFJZtU_b9Y1Y6DQmXurUZZkh3WCudZgwvYasxVU8x3gJiX3jqO" +
            "NttqPhkh7418EFssCKnnaBlUDwsbhp7xdWN4o1L1NvH4bp_R_zJ25F1s6jLmNm2Q" +
            "p9LqU133PEdcRIqQPgBMyZBWUTyxQ9ihKY1RAjlztAULQ3wKea-rfe0BXJZeUJBs" +
            "QPzYCnbKY1dON_NRd8N9pTImqf41MpIbEe7YEOHuirIb6HBpurhAHjTLDv1IuHpE" +
            "AOxpmtxVVHiVf-FYXzTFmn4cGe2PsNJfBl8R_zow2n6qaSANdvSxJDE4DUgIJ6H1" +
            "8wiSJJHp6Plf_bapccAwxbx-zZCw";

        const client1 = new Client({ serverUrl: mockUrl, tokenResponse: {}});
        expect(client1.user.id).to.equal(null);
        expect(client1.getUserId()).to.equal(null);
        expect(client1.getFhirUser()).to.equal(null);
        expect(client1.getUserType()).to.equal(null);

        const client2 = new Client({ serverUrl: mockUrl, tokenResponse: { id_token: idToken }});
        expect(client2.user.id).to.equal("smart-Practitioner-72080416");
        expect(client2.getUserId()).to.equal("smart-Practitioner-72080416");
        expect(client2.getFhirUser()).to.equal("Practitioner/smart-Practitioner-72080416");
        expect(client2.getUserType()).to.equal("Practitioner");
    });

    it ("client.getAuthorizationHeader", () => {
        const client = new Client({ serverUrl: mockUrl, tokenResponse: {}});
        expect(client.getAuthorizationHeader()).to.equal(null);
        client.state.username = "my-username";
        expect(client.getAuthorizationHeader()).to.equal(null);
        client.state.password = "my-password";
        expect(client.getAuthorizationHeader()).to.equal("Basic " + Buffer.from("my-username:my-password", "ascii").toString("base64"));
        (client.state.tokenResponse as any).access_token = "my-token";
        expect(client.getAuthorizationHeader()).to.equal("Bearer my-token");
    });

    describe ("client.refresh", () => {
        
        it ("Validates state and rejects if no refreshToken", async () => {
            return expect(new Client({
                serverUrl: "http://whatever",
                tokenUri : "whatever",
                tokenResponse: {
                    access_token: "whatever",
                    scope       : "test"
                }
            }).refresh(), "should reject with no refreshToken").to.reject(/\brefresh_token\b/);
        });

        it ("Validates state and rejects if no tokenUri", async () => {
            return expect(new Client({
                serverUrl: "http://whatever",
                tokenResponse: {
                    access_token : "whatever",
                    refresh_token: "whatever",
                    scope        : "test"
                }
            }).refresh(), "should reject with no tokenUri").to.reject(/\btokenUri\b/);
        });

        it ("Validates state and rejects if no offline_access or online_access scope", async () => {
            return expect(new Client({
                serverUrl: "http://whatever",
                tokenUri : "whatever",
                tokenResponse: {
                    access_token : "whatever",
                    refresh_token: "whatever",
                    scope        : "test"
                }
            }).refresh(), "should reject with no offline_access or online_access scope").to.reject(/\boffline_access\b/);
        });

        it ("Validates state and rejects if no scope", async () => {
            return expect(new Client({
                serverUrl: "http://whatever",
                tokenUri : "whatever",
                tokenResponse: {
                    access_token : "whatever",
                    refresh_token: "whatever"
                }
            }).refresh(), "should reject with no scope").to.reject(/\boffline_access\b/);
        });

        it ("Rejects if no access token is received", async () => {
            mockServer.mock({ body: { result: false }});
            const client = new Client({
                serverUrl: "http://whatever",
                tokenUri : mockUrl,
                tokenResponse: {
                    access_token : "whatever",
                    refresh_token: "whatever",
                    scope        : "offline_access"
                }
            });  
            return expect(client.refresh(), "should reject if the token endpoint does not return access_token").to.reject("No access token received");
        });

        it ("Includes auth header for confidential clients", async () => {
            const key     = "my-key";
            const storage = new MemoryStorage();
            const state = {
                serverUrl: mockUrl,
                tokenUri: mockUrl,
                clientSecret: "MyClientSecret",
                clientId: "my_web_app",
                tokenResponse: {
                    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb250ZXh0Ijp7Im5lZWRfcGF0aWVudF9iYW5uZXIiOnRydWUsInNtYXJ0X3N0eWxlX3VybCI6Imh0dHBzOi8vbGF1bmNoLnNtYXJ0aGVhbHRoaXQub3JnL3NtYXJ0LXN0eWxlLmpzb24iLCJwYXRpZW50IjoiZWIzMjcxZTEtYWUxYi00NjQ0LTkzMzItNDFlMzJjODI5NDg2IiwiZW5jb3VudGVyIjoiMzFiMThhYTAtMGRhNy00NDYwLTk2MzMtMDRhZjQxNDY2ZDc2In0sImNsaWVudF9pZCI6Im15X3dlYl9hcHAiLCJzY29wZSI6Im9wZW5pZCBmaGlyVXNlciBvZmZsaW5lX2FjY2VzcyB1c2VyLyouKiBwYXRpZW50LyouKiBsYXVuY2gvZW5jb3VudGVyIGxhdW5jaC9wYXRpZW50IHByb2ZpbGUiLCJ1c2VyIjoiUHJhY3RpdGlvbmVyL3NtYXJ0LVByYWN0aXRpb25lci03MTQ4MjcxMyIsImlhdCI6MTU1ODcxMDk2NCwiZXhwIjoxNTkwMjQ2OTY1fQ.f5yNY-yKKDe0a59_eFgp6s0rHSgPLXgmAWDPz_hEUgs",
                    "expires_in"   : 1,
                    "access_token" : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuZWVkX3BhdGllbnRfYmFubmVyIjp0cnVlLCJzbWFydF9zdHlsZV91cmwiOiJodHRwczovL2xhdW5jaC5zbWFydGhlYWx0aGl0Lm9yZy9zbWFydC1zdHlsZS5qc29uIiwicGF0aWVudCI6ImViMzI3MWUxLWFlMWItNDY0NC05MzMyLTQxZTMyYzgyOTQ4NiIsImVuY291bnRlciI6IjMxYjE4YWEwLTBkYTctNDQ2MC05NjMzLTA0YWY0MTQ2NmQ3NiIsInJlZnJlc2hfdG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKamIyNTBaWGgwSWpwN0ltNWxaV1JmY0dGMGFXVnVkRjlpWVc1dVpYSWlPblJ5ZFdVc0luTnRZWEowWDNOMGVXeGxYM1Z5YkNJNkltaDBkSEJ6T2k4dmJHRjFibU5vTG5OdFlYSjBhR1ZoYkhSb2FYUXViM0puTDNOdFlYSjBMWE4wZVd4bExtcHpiMjRpTENKd1lYUnBaVzUwSWpvaVpXSXpNamN4WlRFdFlXVXhZaTAwTmpRMExUa3pNekl0TkRGbE16SmpPREk1TkRnMklpd2laVzVqYjNWdWRHVnlJam9pTXpGaU1UaGhZVEF0TUdSaE55MDBORFl3TFRrMk16TXRNRFJoWmpReE5EWTJaRGMySW4wc0ltTnNhV1Z1ZEY5cFpDSTZJbTE1WDNkbFlsOWhjSEFpTENKelkyOXdaU0k2SW05d1pXNXBaQ0JtYUdseVZYTmxjaUJ2Wm1ac2FXNWxYMkZqWTJWemN5QjFjMlZ5THlvdUtpQndZWFJwWlc1MEx5b3VLaUJzWVhWdVkyZ3ZaVzVqYjNWdWRHVnlJR3hoZFc1amFDOXdZWFJwWlc1MElIQnliMlpwYkdVaUxDSjFjMlZ5SWpvaVVISmhZM1JwZEdsdmJtVnlMM050WVhKMExWQnlZV04wYVhScGIyNWxjaTAzTVRRNE1qY3hNeUlzSW1saGRDSTZNVFUxT0RjeE1EazJOQ3dpWlhod0lqb3hOVGt3TWpRMk9UWTFmUS5mNXlOWS15S0tEZTBhNTlfZUZncDZzMHJIU2dQTFhnbUFXRFB6X2hFVWdzIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsInNjb3BlIjoib3BlbmlkIGZoaXJVc2VyIG9mZmxpbmVfYWNjZXNzIHVzZXIvKi4qIHBhdGllbnQvKi4qIGxhdW5jaC9lbmNvdW50ZXIgbGF1bmNoL3BhdGllbnQgcHJvZmlsZSIsImNsaWVudF9pZCI6Im15X3dlYl9hcHAiLCJleHBpcmVzX2luIjozNjAwLCJpZF90b2tlbiI6ImV5SjBlWEFpT2lKS1YxUWlMQ0poYkdjaU9pSlNVekkxTmlKOS5leUp3Y205bWFXeGxJam9pVUhKaFkzUnBkR2x2Ym1WeUwzTnRZWEowTFZCeVlXTjBhWFJwYjI1bGNpMDNNVFE0TWpjeE15SXNJbVpvYVhKVmMyVnlJam9pVUhKaFkzUnBkR2x2Ym1WeUwzTnRZWEowTFZCeVlXTjBhWFJwYjI1bGNpMDNNVFE0TWpjeE15SXNJbUYxWkNJNkltMTVYM2RsWWw5aGNIQWlMQ0p6ZFdJaU9pSmtZakl6WkRCa1pUSTFOamM0WlRZM01EazVZbU0wTXpRek1qTmtZekJrT1RZMU1UTmlOVFV5TW1RMFlqYzBNV05pWVRNNVpqZGpPVEprTUdNME5tRmxJaXdpYVhOeklqb2lhSFIwY0RvdkwyeGhkVzVqYUM1emJXRnlkR2hsWVd4MGFHbDBMbTl5WnlJc0ltbGhkQ0k2TVRVMU9EY3hNRGsyTlN3aVpYaHdJam94TlRVNE56RTBOVFkxZlEuVzFPSmdWUl9wOTdERlRaSmZhLWI2aWRmNktZMTUtbE81WU9nNHROZkJ5X3dmUHVpbHBUeXZBcDFHRnc2TFpGMnFhNkFWYV9oc1BoXy1GSTJKNkN6MGlqZkFZbVMzdFZwYVZYSGhpMjZsUG5QdUIxVjFUbWJ6YVhDWmJYaC1pdjl4WTNZQXFFRTgyMjFjTXRzQ3FXUFM3aUlMYmJJZmozQnlNMm04aXNRVS1pOGhxLUdTV2ZKNTlwczRGMFZNdlI0QmlPUUdIOXQ5TFQ0TDVxNnNsLU9ONUpJVnJFdnEweFJQVjBrTnpqbUVheklLbV9MMllZM09yMVYwbE02Q0otM2U4RkdkUElIRlRpMjJXcVc1dXhBU2NDVm1hZ1h4S2l5T2xNRWc3dGtjUHA3MjJtS3B0MTMwT3lzaUZyOGpZaElYZkdhX3VGN0tDVFhTZ0RrZEV1WlNRIiwiaWF0IjoxNTU4NzEwOTY1LCJleHAiOjE1NTg3MTQ1NjV9.FDRzViWLg4rMfDzr7Bx01pt5t7CapzcJwQcaFTVcu3E",
                    "scope": "offline_access"
                },
                key,
                storage
            };
            
            storage.set(KEY, key);
            storage.set(key, state);

            const client = new Client(state);

            mockServer.mock({
                handler(req, res) {
                    res.json({
                        headers: req.headers,
                        expires_in: 3600,
                        access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuZWVkX3BhdGllbnRfYmFubmVyIjp0cnVlLCJzbWFydF9zdHlsZV91cmwiOiJodHRwczovL2xhdW5jaC5zbWFydGhlYWx0aGl0Lm9yZy9zbWFydC1zdHlsZS5qc29uIiwicGF0aWVudCI6ImViMzI3MWUxLWFlMWItNDY0NC05MzMyLTQxZTMyYzgyOTQ4NiIsImVuY291bnRlciI6IjMxYjE4YWEwLTBkYTctNDQ2MC05NjMzLTA0YWY0MTQ2NmQ3NiIsInJlZnJlc2hfdG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKamIyNTBaWGgwSWpwN0ltNWxaV1JmY0dGMGFXVnVkRjlpWVc1dVpYSWlPblJ5ZFdVc0luTnRZWEowWDNOMGVXeGxYM1Z5YkNJNkltaDBkSEJ6T2k4dmJHRjFibU5vTG5OdFlYSjBhR1ZoYkhSb2FYUXViM0puTDNOdFlYSjBMWE4wZVd4bExtcHpiMjRpTENKd1lYUnBaVzUwSWpvaVpXSXpNamN4WlRFdFlXVXhZaTAwTmpRMExUa3pNekl0TkRGbE16SmpPREk1TkRnMklpd2laVzVqYjNWdWRHVnlJam9pTXpGaU1UaGhZVEF0TUdSaE55MDBORFl3TFRrMk16TXRNRFJoWmpReE5EWTJaRGMySW4wc0ltTnNhV1Z1ZEY5cFpDSTZJbTE1WDNkbFlsOWhjSEFpTENKelkyOXdaU0k2SW05d1pXNXBaQ0JtYUdseVZYTmxjaUJ2Wm1ac2FXNWxYMkZqWTJWemN5QjFjMlZ5THlvdUtpQndZWFJwWlc1MEx5b3VLaUJzWVhWdVkyZ3ZaVzVqYjNWdWRHVnlJR3hoZFc1amFDOXdZWFJwWlc1MElIQnliMlpwYkdVaUxDSjFjMlZ5SWpvaVVISmhZM1JwZEdsdmJtVnlMM050WVhKMExWQnlZV04wYVhScGIyNWxjaTAzTVRRNE1qY3hNeUlzSW1saGRDSTZNVFUxT0RjeE1EazJOQ3dpWlhod0lqb3hOVGt3TWpRMk9UWTFmUS5mNXlOWS15S0tEZTBhNTlfZUZncDZzMHJIU2dQTFhnbUFXRFB6X2hFVWdzIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsInNjb3BlIjoib3BlbmlkIGZoaXJVc2VyIG9mZmxpbmVfYWNjZXNzIHVzZXIvKi4qIHBhdGllbnQvKi4qIGxhdW5jaC9lbmNvdW50ZXIgbGF1bmNoL3BhdGllbnQgcHJvZmlsZSIsImNsaWVudF9pZCI6Im15X3dlYl9hcHAiLCJleHBpcmVzX2luIjozNjAwLCJpZF90b2tlbiI6ImV5SjBlWEFpT2lKS1YxUWlMQ0poYkdjaU9pSlNVekkxTmlKOS5leUp3Y205bWFXeGxJam9pVUhKaFkzUnBkR2x2Ym1WeUwzTnRZWEowTFZCeVlXTjBhWFJwYjI1bGNpMDNNVFE0TWpjeE15SXNJbVpvYVhKVmMyVnlJam9pVUhKaFkzUnBkR2x2Ym1WeUwzTnRZWEowTFZCeVlXTjBhWFJwYjI1bGNpMDNNVFE0TWpjeE15SXNJbUYxWkNJNkltMTVYM2RsWWw5aGNIQWlMQ0p6ZFdJaU9pSmtZakl6WkRCa1pUSTFOamM0WlRZM01EazVZbU0wTXpRek1qTmtZekJrT1RZMU1UTmlOVFV5TW1RMFlqYzBNV05pWVRNNVpqZGpPVEprTUdNME5tRmxJaXdpYVhOeklqb2lhSFIwY0RvdkwyeGhkVzVqYUM1emJXRnlkR2hsWVd4MGFHbDBMbTl5WnlJc0ltbGhkQ0k2TVRVMU9EY3hNRGsyTlN3aVpYaHdJam94TlRVNE56RTBOVFkxZlEuVzFPSmdWUl9wOTdERlRaSmZhLWI2aWRmNktZMTUtbE81WU9nNHROZkJ5X3dmUHVpbHBUeXZBcDFHRnc2TFpGMnFhNkFWYV9oc1BoXy1GSTJKNkN6MGlqZkFZbVMzdFZwYVZYSGhpMjZsUG5QdUIxVjFUbWJ6YVhDWmJYaC1pdjl4WTNZQXFFRTgyMjFjTXRzQ3FXUFM3aUlMYmJJZmozQnlNMm04aXNRVS1pOGhxLUdTV2ZKNTlwczRGMFZNdlI0QmlPUUdIOXQ5TFQ0TDVxNnNsLU9ONUpJVnJFdnEweFJQVjBrTnpqbUVheklLbV9MMllZM09yMVYwbE02Q0otM2U4RkdkUElIRlRpMjJXcVc1dXhBU2NDVm1hZ1h4S2l5T2xNRWc3dGtjUHA3MjJtS3B0MTMwT3lzaUZyOGpZaElYZkdhX3VGN0tDVFhTZ0RrZEV1WlNRIiwiaWF0IjoxNTU4NzEwOTY1LCJleHAiOjE1NTg3MTQ1NjV9.FDRzViWLg4rMfDzr7Bx01pt5t7CapzcJwQcaFTVcu3E"
                    });
                }
            });

            await client.refresh();
            expect((client.state.tokenResponse as any).headers.authorization).to.exist();
        });

        it ("Ignores parallel invocations", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenUri: mockUrl,
                tokenResponse: {
                    refresh_token: "test_refresh_token",
                    expires_in   : 1,
                    access_token : "test_access_token",
                    scope        : "offline_access"
                }
            });

            mockServer.mock({
                _delay: 10,
                handler(req, res) {
                    res.json({
                        headers: req.headers,
                        expires_in: 3600,
                        access_token: "x"
                    });
                }
            });

            const job1 = client.refresh();
            const job2 = client.refresh();
            await job1;
            await job2;
            expect(job1).to.equal(job2);
        });

        it  ("Allows passing headers", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenUri: mockUrl,
                tokenResponse: {
                    refresh_token: "test_refresh_token",
                    expires_in   : 1,
                    access_token : "test_access_token",
                    scope        : "offline_access"
                }
            });

            mockServer.mock({
                handler(req, res) {
                    res.json({
                        headers: req.headers,
                        expires_in: 3600,
                        access_token: "x"
                    });
                }
            });

            await client.refresh({ headers: { "x-test": "test-value" }});
            expect((client.state.tokenResponse as any).headers).to.contain({ "x-test": "test-value" });
        });

        it ("Allows passing custom authorization header", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenUri: mockUrl,
                tokenResponse: {
                    refresh_token: "test_refresh_token",
                    expires_in   : 1,
                    access_token : "test_access_token",
                    scope        : "offline_access"
                }
            });

            mockServer.mock({
                handler(req, res) {
                    res.json({
                        headers: req.headers,
                        expires_in: 3600,
                        access_token: "x"
                    });
                }
            });

            await client.refresh({ headers: { "authorization": "test-value" }});
            expect((client.state.tokenResponse as any).headers).to.contain({ "authorization": "test-value" });
        });

        it ("Works as expected", async () => {
            const client = new Client({
                serverUrl: mockUrl,
                tokenUri: mockUrl,
                scope: "a offline_access",
                expiresAt: Date.now() + 300,
                tokenResponse: {
                    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb250ZXh0Ijp7Im5lZWRfcGF0aWVudF9iYW5uZXIiOnRydWUsInNtYXJ0X3N0eWxlX3VybCI6Imh0dHBzOi8vbGF1bmNoLnNtYXJ0aGVhbHRoaXQub3JnL3NtYXJ0LXN0eWxlLmpzb24iLCJwYXRpZW50IjoiZWIzMjcxZTEtYWUxYi00NjQ0LTkzMzItNDFlMzJjODI5NDg2IiwiZW5jb3VudGVyIjoiMzFiMThhYTAtMGRhNy00NDYwLTk2MzMtMDRhZjQxNDY2ZDc2In0sImNsaWVudF9pZCI6Im15X3dlYl9hcHAiLCJzY29wZSI6Im9wZW5pZCBmaGlyVXNlciBvZmZsaW5lX2FjY2VzcyB1c2VyLyouKiBwYXRpZW50LyouKiBsYXVuY2gvZW5jb3VudGVyIGxhdW5jaC9wYXRpZW50IHByb2ZpbGUiLCJ1c2VyIjoiUHJhY3RpdGlvbmVyL3NtYXJ0LVByYWN0aXRpb25lci03MTQ4MjcxMyIsImlhdCI6MTU1ODcxMDk2NCwiZXhwIjoxNTkwMjQ2OTY1fQ.f5yNY-yKKDe0a59_eFgp6s0rHSgPLXgmAWDPz_hEUgs",
                    "expires_in"   : 1,
                    "access_token" : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuZWVkX3BhdGllbnRfYmFubmVyIjp0cnVlLCJzbWFydF9zdHlsZV91cmwiOiJodHRwczovL2xhdW5jaC5zbWFydGhlYWx0aGl0Lm9yZy9zbWFydC1zdHlsZS5qc29uIiwicGF0aWVudCI6ImViMzI3MWUxLWFlMWItNDY0NC05MzMyLTQxZTMyYzgyOTQ4NiIsImVuY291bnRlciI6IjMxYjE4YWEwLTBkYTctNDQ2MC05NjMzLTA0YWY0MTQ2NmQ3NiIsInJlZnJlc2hfdG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKamIyNTBaWGgwSWpwN0ltNWxaV1JmY0dGMGFXVnVkRjlpWVc1dVpYSWlPblJ5ZFdVc0luTnRZWEowWDNOMGVXeGxYM1Z5YkNJNkltaDBkSEJ6T2k4dmJHRjFibU5vTG5OdFlYSjBhR1ZoYkhSb2FYUXViM0puTDNOdFlYSjBMWE4wZVd4bExtcHpiMjRpTENKd1lYUnBaVzUwSWpvaVpXSXpNamN4WlRFdFlXVXhZaTAwTmpRMExUa3pNekl0TkRGbE16SmpPREk1TkRnMklpd2laVzVqYjNWdWRHVnlJam9pTXpGaU1UaGhZVEF0TUdSaE55MDBORFl3TFRrMk16TXRNRFJoWmpReE5EWTJaRGMySW4wc0ltTnNhV1Z1ZEY5cFpDSTZJbTE1WDNkbFlsOWhjSEFpTENKelkyOXdaU0k2SW05d1pXNXBaQ0JtYUdseVZYTmxjaUJ2Wm1ac2FXNWxYMkZqWTJWemN5QjFjMlZ5THlvdUtpQndZWFJwWlc1MEx5b3VLaUJzWVhWdVkyZ3ZaVzVqYjNWdWRHVnlJR3hoZFc1amFDOXdZWFJwWlc1MElIQnliMlpwYkdVaUxDSjFjMlZ5SWpvaVVISmhZM1JwZEdsdmJtVnlMM050WVhKMExWQnlZV04wYVhScGIyNWxjaTAzTVRRNE1qY3hNeUlzSW1saGRDSTZNVFUxT0RjeE1EazJOQ3dpWlhod0lqb3hOVGt3TWpRMk9UWTFmUS5mNXlOWS15S0tEZTBhNTlfZUZncDZzMHJIU2dQTFhnbUFXRFB6X2hFVWdzIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsInNjb3BlIjoib3BlbmlkIGZoaXJVc2VyIG9mZmxpbmVfYWNjZXNzIHVzZXIvKi4qIHBhdGllbnQvKi4qIGxhdW5jaC9lbmNvdW50ZXIgbGF1bmNoL3BhdGllbnQgcHJvZmlsZSIsImNsaWVudF9pZCI6Im15X3dlYl9hcHAiLCJleHBpcmVzX2luIjozNjAwLCJpZF90b2tlbiI6ImV5SjBlWEFpT2lKS1YxUWlMQ0poYkdjaU9pSlNVekkxTmlKOS5leUp3Y205bWFXeGxJam9pVUhKaFkzUnBkR2x2Ym1WeUwzTnRZWEowTFZCeVlXTjBhWFJwYjI1bGNpMDNNVFE0TWpjeE15SXNJbVpvYVhKVmMyVnlJam9pVUhKaFkzUnBkR2x2Ym1WeUwzTnRZWEowTFZCeVlXTjBhWFJwYjI1bGNpMDNNVFE0TWpjeE15SXNJbUYxWkNJNkltMTVYM2RsWWw5aGNIQWlMQ0p6ZFdJaU9pSmtZakl6WkRCa1pUSTFOamM0WlRZM01EazVZbU0wTXpRek1qTmtZekJrT1RZMU1UTmlOVFV5TW1RMFlqYzBNV05pWVRNNVpqZGpPVEprTUdNME5tRmxJaXdpYVhOeklqb2lhSFIwY0RvdkwyeGhkVzVqYUM1emJXRnlkR2hsWVd4MGFHbDBMbTl5WnlJc0ltbGhkQ0k2TVRVMU9EY3hNRGsyTlN3aVpYaHdJam94TlRVNE56RTBOVFkxZlEuVzFPSmdWUl9wOTdERlRaSmZhLWI2aWRmNktZMTUtbE81WU9nNHROZkJ5X3dmUHVpbHBUeXZBcDFHRnc2TFpGMnFhNkFWYV9oc1BoXy1GSTJKNkN6MGlqZkFZbVMzdFZwYVZYSGhpMjZsUG5QdUIxVjFUbWJ6YVhDWmJYaC1pdjl4WTNZQXFFRTgyMjFjTXRzQ3FXUFM3aUlMYmJJZmozQnlNMm04aXNRVS1pOGhxLUdTV2ZKNTlwczRGMFZNdlI0QmlPUUdIOXQ5TFQ0TDVxNnNsLU9ONUpJVnJFdnEweFJQVjBrTnpqbUVheklLbV9MMllZM09yMVYwbE02Q0otM2U4RkdkUElIRlRpMjJXcVc1dXhBU2NDVm1hZ1h4S2l5T2xNRWc3dGtjUHA3MjJtS3B0MTMwT3lzaUZyOGpZaElYZkdhX3VGN0tDVFhTZ0RrZEV1WlNRIiwiaWF0IjoxNTU4NzEwOTY1LCJleHAiOjE1NTg3MTQ1NjV9.FDRzViWLg4rMfDzr7Bx01pt5t7CapzcJwQcaFTVcu3E",
                    "scope": "offline_access"
                }
            });

            const fakeTokenResponse = {
                body: {
                    "expires_in": 3600,
                    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuZWVkX3BhdGllbnRfYmFubmVyIjp0cnVlLCJzbWFydF9zdHlsZV91cmwiOiJodHRwczovL2xhdW5jaC5zbWFydGhlYWx0aGl0Lm9yZy9zbWFydC1zdHlsZS5qc29uIiwicGF0aWVudCI6ImViMzI3MWUxLWFlMWItNDY0NC05MzMyLTQxZTMyYzgyOTQ4NiIsImVuY291bnRlciI6IjMxYjE4YWEwLTBkYTctNDQ2MC05NjMzLTA0YWY0MTQ2NmQ3NiIsInJlZnJlc2hfdG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKamIyNTBaWGgwSWpwN0ltNWxaV1JmY0dGMGFXVnVkRjlpWVc1dVpYSWlPblJ5ZFdVc0luTnRZWEowWDNOMGVXeGxYM1Z5YkNJNkltaDBkSEJ6T2k4dmJHRjFibU5vTG5OdFlYSjBhR1ZoYkhSb2FYUXViM0puTDNOdFlYSjBMWE4wZVd4bExtcHpiMjRpTENKd1lYUnBaVzUwSWpvaVpXSXpNamN4WlRFdFlXVXhZaTAwTmpRMExUa3pNekl0TkRGbE16SmpPREk1TkRnMklpd2laVzVqYjNWdWRHVnlJam9pTXpGaU1UaGhZVEF0TUdSaE55MDBORFl3TFRrMk16TXRNRFJoWmpReE5EWTJaRGMySW4wc0ltTnNhV1Z1ZEY5cFpDSTZJbTE1WDNkbFlsOWhjSEFpTENKelkyOXdaU0k2SW05d1pXNXBaQ0JtYUdseVZYTmxjaUJ2Wm1ac2FXNWxYMkZqWTJWemN5QjFjMlZ5THlvdUtpQndZWFJwWlc1MEx5b3VLaUJzWVhWdVkyZ3ZaVzVqYjNWdWRHVnlJR3hoZFc1amFDOXdZWFJwWlc1MElIQnliMlpwYkdVaUxDSjFjMlZ5SWpvaVVISmhZM1JwZEdsdmJtVnlMM050WVhKMExWQnlZV04wYVhScGIyNWxjaTAzTVRRNE1qY3hNeUlzSW1saGRDSTZNVFUxT0RjeE1EazJOQ3dpWlhod0lqb3hOVGt3TWpRMk9UWTFmUS5mNXlOWS15S0tEZTBhNTlfZUZncDZzMHJIU2dQTFhnbUFXRFB6X2hFVWdzIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsInNjb3BlIjoib3BlbmlkIGZoaXJVc2VyIG9mZmxpbmVfYWNjZXNzIHVzZXIvKi4qIHBhdGllbnQvKi4qIGxhdW5jaC9lbmNvdW50ZXIgbGF1bmNoL3BhdGllbnQgcHJvZmlsZSIsImNsaWVudF9pZCI6Im15X3dlYl9hcHAiLCJleHBpcmVzX2luIjozNjAwLCJpZF90b2tlbiI6ImV5SjBlWEFpT2lKS1YxUWlMQ0poYkdjaU9pSlNVekkxTmlKOS5leUp3Y205bWFXeGxJam9pVUhKaFkzUnBkR2x2Ym1WeUwzTnRZWEowTFZCeVlXTjBhWFJwYjI1bGNpMDNNVFE0TWpjeE15SXNJbVpvYVhKVmMyVnlJam9pVUhKaFkzUnBkR2x2Ym1WeUwzTnRZWEowTFZCeVlXTjBhWFJwYjI1bGNpMDNNVFE0TWpjeE15SXNJbUYxWkNJNkltMTVYM2RsWWw5aGNIQWlMQ0p6ZFdJaU9pSmtZakl6WkRCa1pUSTFOamM0WlRZM01EazVZbU0wTXpRek1qTmtZekJrT1RZMU1UTmlOVFV5TW1RMFlqYzBNV05pWVRNNVpqZGpPVEprTUdNME5tRmxJaXdpYVhOeklqb2lhSFIwY0RvdkwyeGhkVzVqYUM1emJXRnlkR2hsWVd4MGFHbDBMbTl5WnlJc0ltbGhkQ0k2TVRVMU9EY3hNRGsyTlN3aVpYaHdJam94TlRVNE56RTBOVFkxZlEuVzFPSmdWUl9wOTdERlRaSmZhLWI2aWRmNktZMTUtbE81WU9nNHROZkJ5X3dmUHVpbHBUeXZBcDFHRnc2TFpGMnFhNkFWYV9oc1BoXy1GSTJKNkN6MGlqZkFZbVMzdFZwYVZYSGhpMjZsUG5QdUIxVjFUbWJ6YVhDWmJYaC1pdjl4WTNZQXFFRTgyMjFjTXRzQ3FXUFM3aUlMYmJJZmozQnlNMm04aXNRVS1pOGhxLUdTV2ZKNTlwczRGMFZNdlI0QmlPUUdIOXQ5TFQ0TDVxNnNsLU9ONUpJVnJFdnEweFJQVjBrTnpqbUVheklLbV9MMllZM09yMVYwbE02Q0otM2U4RkdkUElIRlRpMjJXcVc1dXhBU2NDVm1hZ1h4S2l5T2xNRWc3dGtjUHA3MjJtS3B0MTMwT3lzaUZyOGpZaElYZkdhX3VGN0tDVFhTZ0RrZEV1WlNRIiwiaWF0IjoxNTU4NzEwOTY1LCJleHAiOjE1NTg3MTQ1NjV9.FDRzViWLg4rMfDzr7Bx01pt5t7CapzcJwQcaFTVcu3E"
                }
            };

            mockServer.mock(fakeTokenResponse);

            // 1. Manual refresh
            client.state.scope = "a offline_access b"
            await client.refresh();
            expect((client.state.tokenResponse as any).expires_in).to.equal(3600);

            // 2. Automatic refresh
            client.state.expiresAt = 0;
            client.state.scope = "offline_access c d"
            mockServer.mock(fakeTokenResponse);
            mockServer.mock({
                status: 200,
                headers: {
                    "content-type": "application/json"
                },
                body: {
                    msg: "successful after all"
                }
            });
            const result = await client.request("/Patient");
            expect(result).to.equal({ msg: "successful after all" });

            // @ts-ignore
            expect((console as Console).entries).to.equal([
                ["warn", [msg.rejectedScopes, 'a']],
                ["warn", [msg.rejectedScopes, 'a", "b']],
                ["warn", [msg.rejectedScopes, 'c", "d']]
            ])
        });
    });

    it ("getPatientId()", () => {
        const client = new Client(mockUrl);

        // Open server
        console.clear()
        expect(client.getPatientId()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noPatientFromOpenServer]]]);

        // No tokenResponse and authorizeUri means not authorized
        Object.assign(client.state, { authorizeUri: "whatever" });
        console.clear()
        expect(client.getPatientId()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noPatientBeforeAuth]]]);

        // if the server does not support patient context
        Object.assign(client.state, { tokenResponse: { scope: "launch" } });
        console.clear()
        expect(client.getPatientId()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noPatientAvailable]]]);

        Object.assign(client.state, { tokenResponse: { scope: "launch/patient" } });
        console.clear()
        expect(client.getPatientId()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noPatientAvailable]]]);
    });

    it ("getEncounterId()", () => {
        const client = new Client(mockUrl);

        // Open server
        console.clear()
        expect(client.getEncounterId()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noEncounterFromOpenServer]]])

        // No tokenResponse and authorizeUri means not authorized
        Object.assign(client.state, { authorizeUri: "whatever" });
        console.clear()
        expect(client.getEncounterId()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noEncounterBeforeAuth]]]);

        // if the server does not support encounter context
        Object.assign(client.state, { tokenResponse: { scope: "launch" } });
        console.clear()
        expect(client.getEncounterId()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noEncounterAvailable]]]);

        Object.assign(client.state, { tokenResponse: { scope: "launch/encounter" } });
        console.clear()
        expect(client.getEncounterId()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noEncounterAvailable]]]);

        // We have tokenResponse but didn't get encounter because no scopes were requested
        Object.assign(client.state, { tokenResponse: {} });
        console.clear()
        expect(client.getEncounterId()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noEncounterScopes]]]);
    });

    it ("getIdToken()", () => {
        const client = new Client(mockUrl);

        // Open server
        console.clear()
        expect(client.getIdToken()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noUserFromOpenServer]]]);

        // No tokenResponse and authorizeUri means not authorized
        Object.assign(client.state, { authorizeUri: "whatever" });
        console.clear()
        expect(client.getIdToken()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noUserBeforeAuth]]]);

        // No tokenResponse and no authorizeUri means open server
        Object.assign(client.state, { authorizeUri: undefined });
        console.clear()
        expect(client.getIdToken()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noUserFromOpenServer]]]);

        // Still no token?
        Object.assign(client.state, { scope: "openid fhirUser", tokenResponse: { scope: "openid fhirUser" } });
        console.clear()
        expect(client.getIdToken()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noUserAvailable]]]);

        Object.assign(client.state, { scope: "openid profile", tokenResponse: { scope: "openid profile" } });
        console.clear()
        expect(client.getIdToken()).to.equal(null);
        // @ts-ignore
        expect(console.entries).to.equal([["warn", [msg.noUserAvailable]]]);
    });

    // it ("clearAuthorization()", async () => {
    //     const key = "my-key";
    //     const storage = new MemoryStorage()
    //     await storage.set(KEY, key);
    //     await storage.set(key, "whatever");

    //     const client = new Client({
    //         serverUrl: mockUrl,
    //         scope: "openid fhirUser",
    //         tokenResponse: { a: "b" },
    //     });
    //     client.setStorage(storage)

    //     // @ts-ignore
    //     await client.clearAuthorization();
    //     expect(client.state.tokenResponse).to.equal({});
    //     expect(storage.get(KEY)).to.be.empty();
    //     expect(storage.get(key)).to.be.empty();
    // });

    it ("byCode", () => {
        const client = new Client("http://localhost");
        const observation1 = require("./mocks/Observation-1.json");
        const observation2 = require("./mocks/Observation-2.json");

        const resources = [
            observation1,
            observation2,
            {},
            {
                resourceType: "Observation",
                category: [
                    null,
                    {
                        codding: null
                    }
                ]
            },
            {
                resourceType: "Observation",
                category: [
                    {
                        coding: [
                            {
                                code: null
                            }
                        ]
                    }
                ]
            }
        ];

        expect<fhirclient.ObservationMap>(client.byCode(resources, "code")).to.equal({
            "55284-4": [ observation1 ],
            "6082-2" : [ observation2 ]
        });

        expect<fhirclient.ObservationMap>(client.byCode(resources, "category")).to.equal({
            "vital-signs": [ observation1 ],
            "laboratory" : [ observation2 ]
        });

        expect<fhirclient.ObservationMap>(client.byCode(resources, "missing")).to.equal({});
    });

    it ("byCodes", () => {
        const client = new Client("http://localhost");
        const observation1 = require("./mocks/Observation-1.json");
        const observation2 = require("./mocks/Observation-2.json");

        const resources = [
            observation1,
            observation2,
            observation1,
            observation2
        ];

        expect(client.byCodes(resources, "code")("55284-4")).to.equal([observation1, observation1]);

        expect(client.byCodes(resources, "code")("6082-2")).to.equal([observation2, observation2]);

        expect(client.byCodes(resources, "category")("laboratory")).to.equal([observation2, observation2]);
    });

    it ("create", async () => {
        const client = new Client(mockUrl);
        const resource = { resourceType: "Patient" };

        let result: any;

        // Passing the includeResponse option
        mockServer.mock({ body: resource });
        result = await client.create(resource, { includeResponse: true });
        expect(result.body).to.equal(resource);
        expect(result.response.status).to.equal(200);

        client.request = async (options: any) => options;

        // Standard usage
        result = await client.create(resource);
        expect(result).to.equal({
            url    : "Patient",
            method : "POST",
            body   : JSON.stringify(resource),
            headers: {
                "Content-Type": "application/json"
            }
        });

        // Passing options
        result = await client.create(resource, {
            url   : "a",
            method: "b",
            body  : "c",
            // @ts-ignore
            signal: "whatever",
            headers: {
                "x-custom": "value",
                "Content-Type": "application/fhir+json"
            }
        });
        expect(result).to.equal({
            url    : "Patient",
            method : "POST",
            body   : JSON.stringify(resource),
            signal : "whatever",
            headers: {
                "x-custom": "value",
                "Content-Type": "application/fhir+json"
            }
        });

        // Passing options but no headers
        result = await client.create(resource, {
            url   : "a",
            method: "b",
            body  : "c",
            // @ts-ignore
            signal: "whatever"
        });
        expect(result).to.equal({
            url    : "Patient",
            method : "POST",
            body   : JSON.stringify(resource),
            signal : "whatever",
            headers: {
                "Content-Type": "application/json"
            }
        });
    });

    it ("update", async () => {
        const client = new Client(mockUrl);
        const resource = { resourceType: "Patient", id: "2" };
        let result: any;

        // Passing the includeResponse option
        mockServer.mock({ body: resource });
        result = await client.update(resource, { includeResponse: true });
        expect(result.body).to.equal(resource);
        expect(result.response.status).to.equal(200);

        client.request = async (options: any) => options;

        // Standard usage
        result = await client.update(resource);
        expect(result).to.equal({
            url    : "Patient/2",
            method : "PUT",
            body   : JSON.stringify(resource),
            headers: {
                "Content-Type": "application/json"
            }
        });

        // Passing options
        result = await client.update(resource, {
            url   : "a",
            method: "b",
            body  : "c",
            // @ts-ignore
            signal: "whatever",
            headers: {
                "x-custom": "value",
                "Content-Type": "application/fhir+json"
            }
        });
        expect(result).to.equal({
            url    : "Patient/2",
            method : "PUT",
            body   : JSON.stringify(resource),
            signal: "whatever",
            headers: {
                "x-custom": "value",
                "Content-Type": "application/fhir+json"
            }
        });

        // Passing options but no headers
        result = await client.update(resource, {
            url   : "a",
            method: "b",
            body  : "c",
            // @ts-ignore
            signal: "whatever"
        });
        expect(result).to.equal({
            url    : "Patient/2",
            method : "PUT",
            body   : JSON.stringify(resource),
            signal: "whatever",
            headers: {
                "Content-Type": "application/json"
            }
        });
    });

    it ("delete", async () => {
        const client = new Client(mockUrl);
        
        let result: any;

        // Passing the includeResponse option
        mockServer.mock({ body: { result: "success" }});
        
        result = await client.delete("Patient/2", { includeResponse: true });
        expect(result.body).to.equal({ result: "success" });
        expect(result.response.status).to.equal(200);

        client.request = async (options: any) => options;

        // Standard usage
        result = await client.delete("Patient/2");
        expect(result).to.equal({
            url   : "Patient/2",
            method: "DELETE"
        });

        // Verify that method and url cannot be overridden
        result = await client.delete("Patient/2", {
            // @ts-ignore
            url   : "x",
            method: "y",
            other : 3
        });
        expect(result).to.equal({
            url   : "Patient/2",
            method: "DELETE",
            other : 3
        });

        // Verify that abort signal is passed through
        result = await client.delete("Patient/2", {
            // @ts-ignore
            signal: "whatever"
        });
        expect(result).to.equal({
            url   : "Patient/2",
            method: "DELETE",
            signal: "whatever"
        });
    });

    it ("getFhirVersion", async () => {
        const client = new Client(mockUrl);
        mockServer.mock({ body: { fhirVersion: "1.2.3" }});
        const version = await client.getFhirVersion();
        expect(version).to.equal("1.2.3");
    });

    it ("getFhirRelease", async () => {
        const client = new Client(mockUrl);
        mockServer.mock({ body: { fhirVersion: "3.3.0" }});
        const version = await client.getFhirRelease();
        expect(version).to.equal(4);
    });

    it ("getFhirRelease returns 0 for unknown versions", async () => {
        const client = new Client(mockUrl);
        mockServer.mock({ body: { fhirVersion: "8.3.0" }});
        const version = await client.getFhirRelease();
        expect(version).to.equal(0);

        mockServer.mock({ body: {}});
        const version2 = await client.getFhirRelease();
        expect(version2).to.equal(0);
    });

    describe("units", () => {
        it ("cm", () => {
            const client = new Client("http://localhost");
            expect(client.units.cm({ code: "cm", value: 3 })).to.equal(3);
            expect(client.units.cm({ code: "m", value: 3 })).to.equal(300);
            expect(client.units.cm({ code: "in", value: 3 })).to.equal(3 * 2.54);
            expect(client.units.cm({ code: "[in_us]", value: 3 })).to.equal(3 * 2.54);
            expect(client.units.cm({ code: "[in_i]", value: 3 })).to.equal(3 * 2.54);
            expect(client.units.cm({ code: "ft", value: 3 })).to.equal(3 * 30.48);
            expect(client.units.cm({ code: "[ft_us]", value: 3 })).to.equal(3 * 30.48);
            expect(() => client.units.cm({ code: "xx", value: 3 })).to.throw();
            // @ts-ignore
            expect(() => client.units.cm({ code: "m", value: "x" })).to.throw();
        });
        it ("kg", () => {
            const client = new Client("http://localhost");
            expect(client.units.kg({ code: "kg", value: 3 })).to.equal(3);
            expect(client.units.kg({ code: "g", value: 3 })).to.equal(3 / 1000);
            expect(client.units.kg({ code: "lb", value: 3 })).to.equal(3 / 2.20462);
            expect(client.units.kg({ code: "oz", value: 3 })).to.equal(3 / 35.274);
            expect(() => client.units.kg({ code: "xx", value: 3 })).to.throw();
            // @ts-ignore
            expect(() => client.units.kg({ code: "lb", value: "x" })).to.throw();
        });
        it ("any", () => {
            const client = new Client("http://localhost");
            // @ts-ignore
            expect(client.units.any({ value: 3 })).to.equal(3);
            // @ts-ignore
            expect(() => client.units.kg({ value: "x" })).to.throw();
        });
    });

    describe("getPath", () => {
        it ("returns the first arg if no path", () => {
            const client = new Client("http://localhost");
            const data = {};
            expect(client.getPath(data)).to.equal(data);
        });
        it ("returns the first arg for empty path", () => {
            const client = new Client("http://localhost");
            const data = {};
            expect(client.getPath(data, "")).to.equal(data);
        });
        it ("works as expected", () => {
            const client = new Client("http://localhost");
            const data = { a: 1, b: [0, { a: 2 }] };
            expect(client.getPath(data, "b.1.a")).to.equal(2);
            expect(client.getPath(data, "b.4.a")).to.equal(undefined);
        });
    });

    describe("getState", () => {
        it ("returns the entire state", () => {
            const state = { a: { b: [ { c: 2 } ] }, serverUrl: "http://x" };
            const client = new Client(state);
            expect(client.getState()).to.equal(state);
        });

        it ("can get single path", () => {
            const state = { a: { b: [ { c: 2 } ] }, serverUrl: "http://x" };
            const client = new Client(state);
            expect(client.getState("serverUrl")).to.equal(state.serverUrl);
        });

        it ("can get nested path", () => {
            const state = { a: { b: [ { c: 2 } ] }, serverUrl: "http://x" };
            const client = new Client(state);
            expect(client.getState("a.b.0.c")).to.equal(2);
        });

        it ("keeps state immutable", () => {
            const state = { a: { b: [ { c: 2 } ] }, serverUrl: "http://x" };
            const client = new Client(state);
            const result = client.getState();
            result.a = 5;
            expect(client.getState("a")).to.equal(state.a);
        });
    });

    describe("browser-specific tests", () => {
        beforeEach(() => {
            (global as any).window = (global as any).self = new MockWindow();
            (global as any).sessionStorage = self.sessionStorage;
        });
        
        afterEach(() => {
            delete (global as any).window;
            delete (global as any).self;
            delete (global as any).sessionStorage;
        });

        // it ("clearAuthorization() with sessionStorage", async () => {
        //     const key = "my-key";
        //     const storage = new BrowserStorage()
        //     await storage.set(KEY, key);
        //     await storage.set(key, "whatever");
    
        //     const client = new Client({
        //         serverUrl: mockUrl,
        //         scope: "openid fhirUser",
        //         tokenResponse: { a: "b" }
        //     });
        //     client.setStorage(storage)
    
        //     // @ts-ignore
        //     await client.clearAuthorization();
        //     expect(client.state.tokenResponse).to.equal({});
        //     expect(storage.get(KEY)).to.be.empty();
        //     expect(storage.get(key)).to.be.empty();
        // });

        // it ("clearAuthorization() with namespaced sessionStorage", async () => {
        //     const initialState = { serverUrl: mockUrl, tokenResponse: { a: "b" }} as any;
        //     const storage = new NamespacedStorage(new BrowserStorage(), "smart");
        //     expect(await storage.get("x")).to.equal(undefined);
        //     sessionStorage.setItem("smart", "true")
        //     expect(await storage.get("x")).to.equal(undefined);
        //     sessionStorage.removeItem("smart")

        //     const client = new Client(initialState);
        //     client.setStorage(storage)
        //     expect(client.state, "bad initial client state").to.equal(initialState);
        //     expect(sessionStorage.getItem("smart"), "client shouldn't save state until _saveState is called").to.be.undefined();

        //     // Storage can be modified in parallel
        //     await storage.set("test", 2)
        //     await storage.set("x", 3)
        //     expect(await storage.unset("x")).to.be.true()
        //     expect(await storage.unset("x")).to.be.false()
        //     expect(sessionStorage.getItem("smart")).to.equal(JSON.stringify({ test: 2 }));

        //     // Client saves its state and clears unknown items (remember: we own the namespace!)
        //     // @ts-ignore
        //     await client._saveState();
        //     expect(sessionStorage.getItem("smart")).to.equal(JSON.stringify(initialState));
        //     expect(await storage.get("serverUrl")).to.equal(initialState.serverUrl);
        //     expect(await storage.get("x")).to.equal(undefined);

        //     // expect(sessionStorage.getItem("smart"), "bad initial sessionStorage state").to.equal(JSON.stringify(initialState));
        //     // Now clear the state
        //     await client.clearAuthorization();
        //     expect(client.state.tokenResponse, "bad client state").to.equal({});
        //     expect(await storage.get("tokenResponse"), "storage not cleared").to.equal(undefined);
        //     expect(sessionStorage.getItem("smart"), "session storage not cleared").to.be.undefined();
        // });

        // it ("_saveState() with sessionStorage", async () => {
        //     const storage = new BrowserStorage()
        //     const client = new Client(mockUrl);
        //     client.setStorage(storage)
        //     // @ts-ignore
        //     await client._saveState();
        //     expect(await storage.get("serverUrl")).to.equal(mockUrl);
        //     expect(sessionStorage.getItem("serverUrl")).to.equal(JSON.stringify(mockUrl));
        // });

        // it ("_saveState() with namespaced sessionStorage", async () => {
        //     const storage = new NamespacedStorage(new BrowserStorage(), "smart");
        //     const client = new Client(mockUrl)
        //     client.setStorage(storage)
        //     expect(client.state, "bad state").to.equal({ serverUrl: mockUrl })
        //     // @ts-ignore
        //     await client._saveState();
        //     const saved = sessionStorage.getItem("smart")
        //     expect(saved, "not saved").to.equal(JSON.stringify({ serverUrl: mockUrl }));
        // });
    });
});
