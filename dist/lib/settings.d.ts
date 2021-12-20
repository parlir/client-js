/**
 * Combined list of FHIR resource types accepting patient parameter in FHIR R2-R4
 */
export declare const patientCompartment: string[];
/**
 * Map of FHIR releases and their abstract version as number
 */
export declare const fhirVersions: {
    "0.4.0": number;
    "0.5.0": number;
    "1.0.0": number;
    "1.0.1": number;
    "1.0.2": number;
    "1.1.0": number;
    "1.4.0": number;
    "1.6.0": number;
    "1.8.0": number;
    "3.0.0": number;
    "3.0.1": number;
    "3.3.0": number;
    "3.5.0": number;
    "4.0.0": number;
    "4.0.1": number;
};
/**
 * Combined (FHIR R2-R4) list of search parameters that can be used to scope
 * a request by patient ID.
 */
export declare const patientParams: string[];
/**
 * The name of the sessionStorage entry that contains the current key
 */
export declare const SMART_KEY = "SMART_KEY";
/**
 * The maximum length for a code verifier for the best security we can offer.
 * Please note the NOTE section of RFC 7636 § 4.1 - the length must be >= 43,
 * but <= 128, **after** base64 url encoding. This means 32 code verifier bytes
 * encoded will be 43 bytes, or 96 bytes encoded will be 128 bytes. So 96 bytes
 * is the highest valid value that can be used.
 */
export declare const RECOMMENDED_CODE_VERIFIER_LENGTH = 96;
/**
 * Character set to generate code verifier defined in rfc7636.
 */
export declare const PKCE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
