import { fhirclient } from "./types";

export {
    getPath,
    setPath
} from "./lib"

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
export function byCode(
    observations: fhirclient.FHIR.Observation | fhirclient.FHIR.Observation[],
    property: string
): fhirclient.ObservationMap
{
    const ret: fhirclient.ObservationMap = {};

    function handleCodeableConcept(concept: fhirclient.FHIR.CodeableConcept, observation: fhirclient.FHIR.Observation) {
        if (concept && Array.isArray(concept.coding)) {
            concept.coding.forEach(({ code }) => {
                if (code) {
                    ret[code] = ret[code] || [] as fhirclient.FHIR.Observation[];
                    ret[code].push(observation);
                }
            });
        }
    }

    makeArray(observations).forEach(o => {
        if (o.resourceType === "Observation" && o[property]) {
            if (Array.isArray(o[property])) {
                o[property].forEach((concept: fhirclient.FHIR.CodeableConcept) => handleCodeableConcept(concept, o));
            } else {
                handleCodeableConcept(o[property], o);
            }
        }
    });

    return ret;
}

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
export function byCodes(
    observations: fhirclient.FHIR.Observation | fhirclient.FHIR.Observation[],
    property: string
): (...codes: string[]) => any[]
{
    const bank = byCode(observations, property);
    return (...codes) => codes
        .filter(code => (code + "") in bank)
        .reduce(
            (prev, code) => prev.concat(bank[code + ""]),
            [] as fhirclient.FHIR.Observation[]
        );
}

/**
 * If the argument is an array returns it as is. Otherwise puts it in an array
 * (`[arg]`) and returns the result
 * @param arg The element to test and possibly convert to array
 * @category Utility
 */
export function makeArray<T = any>(arg: any): T[] {
    if (Array.isArray(arg)) {
        return arg;
    }
    return [arg];
}
