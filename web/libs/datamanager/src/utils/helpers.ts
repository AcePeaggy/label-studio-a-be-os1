import { toCamelCase } from "strman";

export const formDataToJPO = (formData: FormData) => {
  if (formData instanceof FormData) {
    const entries = formData.entries();

    return Array.from(entries).reduce((res, [key, value]) => {
      return { ...res, [key]: value };
    }, {});
  }

  return formData;
};

/**
 * Hydrate JSON values that are large integers to strings.
 */
export const jsonReviverWithBigInt = (_key: any, value: any, context?: any) => {
  if (typeof value === "number" && context?.source !== undefined && Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    // If the number would overflow the JS number precision, retain it to a string
    // from the original source string.
    // Leaving as a string and not a BigInt to avoid issues with JSON.stringify or other cases downstream.
    return context.source;
  }
  return value;
};
/**
 * Parse a JSON string and convert big integers to strings.
 * We convert only big integers that are still integers within the JSON string
 * to avoid JS number precision issues when displaying them in the UI.
 * This is a workaround for the fact that JSON.parse does not directly support big integers and will
 * immediately convert them to numbers (losing precision).
 *
 * ex. { "id": 12345678901234567890 } => { "id": "12345678901234567890" }
 *     { "id": -12345678901234567890 } => { "id": "-12345678901234567890" }
 *     { "meta": { "id": 12345678901234567890 } } => { "meta": { "id": "12345678901234567890" } }
 *     { "meta": { "id": -12345678901234567890 } } => { "meta": { "id": "-12345678901234567890" } }
 **/
export const parseJson = <T = any>(jsonString: string): T => {
  return JSON.parse(jsonString, jsonReviverWithBigInt) as T;
};

export const objectToMap = <T extends Record<string, any>>(object: T) => {
  return new Map(Object.entries(object ?? {}));
};

export const mapToObject = <T extends Map<any, any>>(map: T) => {
  return Object.fromEntries(map);
};

export const filename = (string: string) => {
  if (string) {
    return (
      string
        .split("/")
        .slice(-1)[0]
        .match(/([^?]+)/g)?.[0] ?? string
    );
  }
};

export const isEmptyString = (value: any) => {
  return typeof value === "string" && value.trim().length === 0;
};

export const isEmptyObject = (value: any) => {
  return (typeof value === "object" && !value) || Object.keys(value).length === 0;
};

export const isEmptyArray = (value: any) => {
  return Array.isArray(value) && value.length === 0;
};

export const isEmpty = (value: any) => {
  return isEmptyString(value) || isEmptyObject(value) || isEmptyArray(value);
};

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>;

type ObjectToCamel<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends Record<string, any> ? KeysToCamelCase<T[K]> : T[K];
};

type KeysToCamelCase<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends Array<any>
  ? KeysToCamelCase<T[K][number]>[]
  : ObjectToCamel<T[K]>;
};

export const camelizeKeys = <T extends AnyObject>(source: T | null | undefined): KeysToCamelCase<T> | T | null | undefined => {

  if (typeof source !== 'object' || source === null || source === undefined) {
    return source; // Return source as is if it's not an object, or if it's null/undefined
  }
  type Pair = [string, unknown];

  const split = Object.entries(source);

  const pairs: Pair[] = split.map<Pair>(([key, value]) => {
    if (Object.prototype.toString.call(value) === "[object Object]") {
      return [toCamelCase(key), camelizeKeys(value as T)];
    }

    return [toCamelCase(key), value];
  });

  return Object.fromEntries(pairs) as KeysToCamelCase<T>;
};

export const hasProperties = (obj: AnyObject, properties: string[], all?: boolean) => {
  if (!isDefined(obj)) return false;

  return all
    ? properties.reduce((res, prop) => {
      return res && Object.prototype.hasOwnProperty.call(obj, prop);
    }, true)
    : properties.findIndex((prop) => {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }) >= 0;
};

export const objectClean = <T extends AnyObject>(source: T) => {
  const cleanObject: [keyof T, unknown][] = Object.entries(source).reduce<[keyof T, unknown][]>((res, [key, value]) => {
    const valueIsDefined = isDefined(value) && !isEmptyString(value);

    if (!valueIsDefined) {
      return res;
    }

    if (Object.prototype.toString.call(value) === "[object Object]") {
      return [...res, [key, objectClean(value as AnyObject)]];
    }
    return [...res, [key, value]];
  }, []);

  return Object.fromEntries(cleanObject) as T;
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max));
};

export const absoluteURL = (path = "") => {
  if (path.match(/^https?/) || path.match(/^\/\//)) {
    return path;
  }
  return [APP_SETTINGS.hostname.replace(/([/]+)$/, ""), path.replace(/^([/]+)/, "")].join("/");
};

export const isDefined = <T>(value?: T): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};
