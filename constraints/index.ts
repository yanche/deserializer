import { ConstraintHandler } from "./common";

export * from "./common";
export * from "./others";
export * from "./string";
export * from "./number";

export function isConstraintHandler(val: any): val is ConstraintHandler {
    return val && val.validator instanceof Function && val.validator.length === 1 && typeof val.message === "string";
}
