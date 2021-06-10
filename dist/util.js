"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeArray = exports.byCodes = exports.byCode = void 0;
var lib_1 = require("./lib");
Object.defineProperty(exports, "getPath", { enumerable: true, get: function () { return lib_1.getPath; } });
Object.defineProperty(exports, "setPath", { enumerable: true, get: function () { return lib_1.setPath; } });
/**
 * Groups the observations by code. Returns a map that will look like:
 * ```js
 * const map = client.byCodes(observations, "code");
 * // map = {
 * //     "55284-4": [ observation1, observation2 ],
 * //     "6082-2": [ observation3 ]
 * // }
 * ```
 * @param observations Array of observations
 * @param property The name of a CodeableConcept property to group by
 */
function byCode(observations, property) {
    const ret = {};
    function handleCodeableConcept(concept, observation) {
        if (concept && Array.isArray(concept.coding)) {
            concept.coding.forEach(({ code }) => {
                if (code) {
                    ret[code] = ret[code] || [];
                    ret[code].push(observation);
                }
            });
        }
    }
    makeArray(observations).forEach(o => {
        if (o.resourceType === "Observation" && o[property]) {
            if (Array.isArray(o[property])) {
                o[property].forEach((concept) => handleCodeableConcept(concept, o));
            }
            else {
                handleCodeableConcept(o[property], o);
            }
        }
    });
    return ret;
}
exports.byCode = byCode;
/**
 * First groups the observations by code using `byCode`. Then returns a function
 * that accepts codes as arguments and will return a flat array of observations
 * having that codes. Example:
 * ```js
 * const filter = client.byCodes(observations, "category");
 * filter("laboratory") // => [ observation1, observation2 ]
 * filter("vital-signs") // => [ observation3 ]
 * filter("laboratory", "vital-signs") // => [ observation1, observation2, observation3 ]
 * ```
 * @param observations Array of observations
 * @param property The name of a CodeableConcept property to group by
 */
function byCodes(observations, property) {
    const bank = byCode(observations, property);
    return (...codes) => codes
        .filter(code => (code + "") in bank)
        .reduce((prev, code) => prev.concat(bank[code + ""]), []);
}
exports.byCodes = byCodes;
/**
 * If the argument is an array returns it as is. Otherwise puts it in an array
 * (`[arg]`) and returns the result
 * @param arg The element to test and possibly convert to array
 * @category Utility
 */
function makeArray(arg) {
    if (Array.isArray(arg)) {
        return arg;
    }
    return [arg];
}
exports.makeArray = makeArray;
