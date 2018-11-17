import { forType, decoratorFnFromValidator } from "./common";
import { throwOnFalse } from "../common";
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
        throwOnFalse(minVal <= maxVal, `invalid input for range ${minVal}-${maxVal}`);
        return decoratorFnFromValidator(numValidators.range(minVal, maxVal));
    }
}

export const range = Constraints.range;
export const min = Constraints.min;
export const max = Constraints.max;
