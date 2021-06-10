import { fhirclient } from "./types";
export { getPath, setPath } from "./lib";
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
export declare function byCode(observations: fhirclient.FHIR.Observation | fhirclient.FHIR.Observation[], property: string): fhirclient.ObservationMap;
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
export declare function byCodes(observations: fhirclient.FHIR.Observation | fhirclient.FHIR.Observation[], property: string): (...codes: string[]) => any[];
/**
 * If the argument is an array returns it as is. Otherwise puts it in an array
 * (`[arg]`) and returns the result
 * @param arg The element to test and possibly convert to array
 * @category Utility
 */
export declare function makeArray<T = any>(arg: any): T[];
