import { forType } from "./common";
import { throwOnFalse } from "../common";

class Constraints {
    /**
     * To mark the number field with a min value.
     */
    @forType({
        type: Number,
        isFactory: true,
    })
    public static min(minVal: number) {
        return (target: any, fieldName: string) => {
            Reflect.defineMetadata("min", {
                validator: (val: number) => {
                    return val >= minVal;
                },
                message: `value must be greater than or equal to ${minVal}`,
            }, target, fieldName);
        };
    }

    /**
     * To mark the number field with a max value.
     */
    @forType({
        type: Number,
        isFactory: true,
    })
    public static max(maxVal: number) {
        return (target: any, fieldName: string) => {
            Reflect.defineMetadata("max", {
                validator: (val: number) => {
                    return val <= maxVal;
                },
                message: `value must be less than or equal to ${maxVal}`,
            }, target, fieldName);
        };
    }

    /**
     * To mark the number field within a range.
     */
    @forType({
        type: Number,
        isFactory: true,
    })
    public static range(minVal: number, maxVal: number) {
        throwOnFalse(minVal <= maxVal, `invalid input for range ${minVal}-${maxVal}`);

        return (target: any, fieldName: string) => {
            Reflect.defineMetadata("range", {
                validator: (val: number) => {
                    return minVal <= val && val <= maxVal;
                },
                message: `value must be between ${minVal} and ${maxVal}`,
            }, target, fieldName);
        };
    }
}

export const range = Constraints.range;
export const min = Constraints.min;
export const max = Constraints.max;
