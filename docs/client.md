# Client
This is a FHIR client that is returned to you from the `ready()` call of the SMART API. You can also create it yourself if needed:
```js
// BROWSER
const client = FHIR.client("https://r4.smarthealthit.org");

// SERVER
const client = smart(req, res).client("https://r4.smarthealthit.org");
```
It exposes the following API:

### client.request(uri: String [, [fhirOptions](typedoc/interfaces/_types_d_.fhirclient.fhiroptions.html)]): Promise<[result](#Return-Values)><br/>client.request(url: URL [, [fhirOptions](typedoc/interfaces/_types_d_.fhirclient.fhiroptions.html)]): Promise<[result](#Return-Values)><br/>client.request([options](typedoc/interfaces/_types_d_.fhirclient.requestoptions.html) [, [fhirOptions](typedoc/interfaces/_types_d_.fhirclient.fhiroptions.html)]): Promise<[result](#Return-Values)>

> This is the single most important method. Please see the **[live examples](http://docs.smarthealthit.org/client-js/request.html)**.

#### Return Values
This `client.request` method will always return a `Promise` but it may be resolved with different values depending on the passed arguments or the server response. Here are some examples:

|Return Value|Happens if|Example
|------------|----------|-------
|`String`    |The server replies with `text/plain` or other non-json mime type containing the word `text`|`client.request("someFile.txt");`
|[Response object](https://developer.mozilla.org/en-US/docs/Web/API/Response)|The server replies with anything other than json or text|`client.request("someFile.pdf");`
|`FHIR Resource`|If we request a resource and the server replies with json|`client.request("Patient/id");`
|`FHIR Bundle`|If we request a bundle and the server replies with json|`client.request("Patient");`
|`Array of FHIR bundles`|If we request a bundle and the server replies with json and we use the `pageLimit` option|`client.request("Patient", { pageLimit: 0 });`
|`Array of FHIR resources`|If we request a bundle and the server replies with json and we use the `flat` option|`client.request("Patient", { pageLimit: 0, flat: true });`
|`null`|If we use the `onPage` callback to handle results as they arrive. In this case we don't use the result. We only need to know when the download is complete.|`client.request("Patient", { pageLimit: 5, onPage(bundle) { ... }});`
|`{ response: `[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)`, body: <any of the above>}`|When we use the `includeResponse` option (since v2.3.11)|`client.request("Patient/id", { includeResponse: true });`


***Examples:***

- [Fetch single resource](request.html#fetch-a-resource)
- [Fetch the current patient](request.html#display-the-current-patient-using-client.request)
- [Fetch a Bundle](request.html#fetch-a-bundle)
- [Get all pages](request.html#get-all-pages)
- [Handle pages as they arrive](request.html#process-one-page-at-a-time)
- [Resolve References](request.html#resolve-references)
- [Getting the references as separate object](request.html#fetch-references-to-external-object)
- [Get multiple related resources from single Observation](request.html#extract-multiple-related-resources-from-single-observation)


### client.create(resource: Object, requestOptions = {}) `Promise<Object>`
Wrapper for `client.request` implementing the FHIR resource create operation.

### client.update(resource: Object, requestOptions = {}) `Promise<Object>`
Wrapper for `client.request` implementing the FHIR resource update operation.

### client.delete(uri: String, requestOptions = {}) `Promise<Object>`
Wrapper for `client.request` implementing the FHIR resource delete operation.

***Example:***
```js
client.delete("Patient/id");
```

### client.refresh(requestOptions = {}) `Promise<Object>`
Use the refresh token to obtain new access token. If the refresh token is
expired (or this fails for any other reason) it will be deleted from the
state, so that we don't enter into loops trying to re-authorize.

> Note that that `client.request()` will automatically refresh the access token
for you!

Resolves with the updated state or rejects with an error.

### client.refreshIfNeeded(requestOptions = {}) `Promise<Object>`
Checks if access token and refresh token are present. If they are, and if
the access token is expired or is about to expire in the next 10 seconds,
calls `client.refresh()` to obtain new access token.

### client.api `Object`

Only accessible if fhir.js is available. Read more about the fhir.js integration [here](README.md#fhirjs-integration).

### client.patient.id `String|null`

The selected patient ID or `null` if patient is not available. If no patient is selected, it will generate useful debug messages about the possible reasons. See [debugging](README.md#debugging).

### client.patient.read() `Promise<Object>`
Fetches the selected patient resource (if available). Resolves with the patient or rejects with an error.

### client.patient.request(requestOptions, fhirOptions) `Promise<Object>`
Wrapper for `client.request` that will automatically add a search parameter to the requested URL to filter the requested resources to those related to the current patient. For example:
```js
client.patient.request("Observation"); // -> /Observation?patient=patient-id
client.patient.request("Group");       // -> /Group?member=patient-id
```

### client.patient.api `Object`

Only accessible if fhir.js is available. Read more about the fhir.js integration [here](README.md#fhirjs-integration).

### client.encounter.id `string|null`

The selected encounter ID or `null` if encounter is not available. If no encounter is selected, it will generate useful debug messages about the possible reasons. See [debugging](README.md#debugging).

### client.encounter.read() `Promise<object>`

Fetches the selected encounter resource (if available). Resolves with the encounter or rejects with an error.

### client.user.id `string`
The selected user ID or `null` if user is not available. If no user is selected, it will generate useful debug messages about the possible reasons. See [debugging](README.md#debugging).

### client.user.fhirUser `string`
The selected user identifier that looks like `Practitioner/id` or `null` if user is not available. If no user is selected, it will generate useful debug messages about the possible reasons. See [debugging](README.md#debugging).

### client.user.resourceType `string`

The selected user resourceType (E.g. `Practitioner`, `Patient`, `RelatedPerson`...) or `null` if user is not available. If no user is selected, it will generate useful debug messages about the possible reasons. See [debugging](README.md#debugging).

### client.user.read() `Promise<object>`
Fetches the selected user resource (if available). Resolves with the user or rejects with an error.

### client.getFhirVersion() `Promise<string>`
Returns a promise that will be resolved with the FHIR version as defined in the conformance statement of the server.

### client.getFhirRelease() `Promise<number>`
Returns a promise that will be resolved with the numeric FHIR version:
- `2` for **DSTU2**
- `3` for **STU3**
- `4` for **R4**
- `0` if the version is not known

### client.getState(path=""): `any`
When called without an argument returns a copy of the client state. Accepts a dot-separated path argument (same as for `getPath`) to allow for selecting specific state properties. Note that this is the preferred way to read the state because `client.state.tokenResponse.patient` will throw an error if `client.state.tokenResponse` is undefined, while `client.getState("tokenResponse.patient")` will ignore that and just return `undefined`.

Examples:
```js
client.getState(); // -> the entire state object
client.getState("serverUrl"); // -> the URL we are connected to
client.getState("tokenResponse.patient"); // -> The selected patient ID (if any)
```

---

Finally, there are some **utility methods**, mostly inherited by older versions of the library:
### client.byCode(observations, property) `Object`
Groups the observations by code. Returns a map that will look like:
```js
const map = client.byCodes(observations, "code");
// map = {
//     "55284-4": [ observation1, observation2 ],
//     "6082-2": [ observation3 ]
// }
```

### client.byCodes(observations, property) `Function`
Similar to `byCode` but builds the map internally and returns a filter function
that will produce flat arrays. For example:
```js
const filter = client.byCodes(observations, "category");
filter("laboratory") // => [ observation1, observation2 ]
filter("vital-signs") // => [ observation3 ]
filter("laboratory", "vital-signs") // => [ observation1, observation2, observation3 ]
```

### client.units.cm({ code, value }) `Number`
Converts the `value` to `code`, where `code` can be `cm`, `m`, `in`, `[in_us]`, `[in_i]`, `ft`, `[ft_us]`

### client.units.kg({ code, value }) `Number`
Converts the `value` to `code`, where `code` can be `kg`, `g`, string containing `lb`, string containing `oz`.

### client.units.any({ code, value }) `Number`
Just asserts that `value` is a number and then returns that value

### client.getPath(object, path) `any`
Given an object (or array), tries to walk down to the given dot-separated path
and returns the value. It will return `undefined` if the path cannot find any property. It will NOT throw if an intermediate property does not exist.
The path is dot-separated even for arrays! Examples:
```js
const data = { a: { b: "x" }, c: [ 2, { x: 5}, [1,2,3] ]};
client.getPath(data, "") // => data
client.getPath(data, "a") // => { b: "x" }
client.getPath(data, "a.b") // => "x"
client.getPath(data, "c.1.x") // => 5
client.getPath(data, "c.2.1") // => 2
client.getPath(data, "a.b.c.d.e") // => undefined
```

## Aborting Requests
It is possible to abort HTTP requests since version `2.2.0`. The implementation
is based on the standard `AbortController` approach. You need to create an
instance of `AbortController` and pass it's `AbortSignal` as request option as
shown below.

Note that `client.request` is a powerful method that might start other requests
depending on the passed options (to fetch references or additional pages). If
a `client.request` task is aborted, that will propagate and cancel any sub-requests
that are being executed at that point.


### When used as library
When the bundle is included via `script` tag in a web page, the `AbortController`
class will be globally available (we include a polyfill). Then an abort-able
request could look like this:
```js
const client = new FHIR.client("https://r3.smarthealthit.org");
const abortController = new AbortController();
const signal = abortController.signal;

// Any of these should work
client.request({ url: "Patient", signal });
client.create(resource, { signal });
client.update(resource, { signal });
client.delete("Patient/123", { signal });
client.patient.read({ signal });
client.patient.request({ signal, url: "Immunization" });
client.encounter.read({ signal });
client.user.read({ signal });
client.refresh({ signal });

// Later...
abortController.abort();
```

### When used as module
If the library is used as module (with a bundler or in NodeJS), the usage is the
same, except that the global scope is not polyfilled. You can include your own polyfill for `AbortController`. However, we are already using `AbortController` internally and made it accessible via the entry point:
```js
import FHIR, { AbortController } from "fhirclient"

const client = new FHIR.client("https://r3.smarthealthit.org");
const abortController = new AbortController();

client.request({
    url: "Patient",
    signal: abortController.signal
}).then(console.log, console.error);

// Later...
abortController.abort();
```


