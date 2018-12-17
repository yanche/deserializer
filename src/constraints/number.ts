import { forType, decoratorFnFromValidator } from "./common";
import * as numValidators from "../validators/number";

class Constraints {
    /**
     * To mark the number field with a min value.
     */
    @forType({
        type: Number,
        isFactory: true,
    })
    public static min(minVal: number) {
        return decoratorFnFromValidator(numValidators.min(minVal));
    }

    /**
     * To mark the number field with a max value.
     */
    @forType({
        type: Number,
        isFactory: true,
    })
    public static max(maxVal: number) {
        return decoratorFnFromValidator(numValidators.max(maxVal));
    }

    /**
     * To mark the number field within a range.
     */
    @forType({
        type: Number,
        isFactory: true,
    })
    public static range(minVal: number, maxVal: number) {
        return decoratorFnFromValidator(numValidators.range(minVal, maxVal));
    }

    /**
     * To mark the number field as a safe integer.
     */
    @forType({
        type: Number,
    })
    public static safeInt(target: any, fieldName: string) {
        Reflect.defineMetadata(numValidators.safeInt.name, numValidators.safeInt, target, fieldName);
    }
}

export const range = Constraints.range;
export const min = Constraints.min;
export const max = Constraints.max;
export const safeInt = Constraints.safeInt;
