import { ConstraintValidator } from "./common";

export * from "./common";
export * from "./others";
export * from "./string";
export * from "./number";

export function isConstraintValidator(val: any): val is ConstraintValidator {
    return val && val.validator instanceof Function && val.validator.length === 1 && typeof val.message === "string";
}
