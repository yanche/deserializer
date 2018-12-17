import { ConstraintValidator } from "../constraints/common";
import { throwIf } from "../common";

export function range(minVal: number, maxVal: number): ConstraintValidator {
    throwIf(minVal > maxVal, `invalid input for range ${minVal}-${maxVal}`);
    
    return {
        name: `range-${minVal}-${maxVal}`,
        validate: (val: number) => {
            return minVal <= val && val <= maxVal;
        },
        message: `value must be between ${minVal} and ${maxVal}`,
    };
}

export function max(maxVal: number): ConstraintValidator {
    return {
        name: `max-${maxVal}`,
        validate: (val: number) => {
            return val <= maxVal;
        },
        message: `value must be less than or equal to ${maxVal}`,
    };
}

export function min(minVal: number): ConstraintValidator {
    return {
        name: `min-${minVal}`,
        validate: (val: number) => {
            return val >= minVal;
        },
        message: `value must be greater than or equal to ${minVal}`,
    };
}

export const safeInt: ConstraintValidator = {
    name: "safeInt",
    validate: (val: number) => {
        return Number.isSafeInteger(val);
    },
    message: `value must be a safe integer, defined by Number.isSafeInteger`,
};
