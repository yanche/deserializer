import { forType, ConstraintValidator, decoratorFnFromValidator } from "./common";
import * as stringValidators from "../validators/string";

class Constraints {
    /**
     * To mark the string field as a non empty string.
     */
    @forType({
        type: String,
    })
    public static nonEmptyString(target: any, fieldName: string) {
        Reflect.defineMetadata(stringValidators.nonEmptyString.name, stringValidators.nonEmptyString, target, fieldName);
    }

    /**
     * To mark the string field as a string matches the provided regex.
     */
    @forType({
        type: String,
        isFactory: true,
    })
    public static regex(regex: RegExp) {
        return decoratorFnFromValidator(stringValidators.regex(regex));
    }

    /**
     * To mark the string field as a string without leading or trailing space.
     */
    @forType({
        type: String,
    })
    public static noExtraSpace(target: any, fieldName: string) {
        Reflect.defineMetadata(stringValidators.noExtraSpace.name, stringValidators.noExtraSpace, target, fieldName);
    }
}

export const nonEmptyString = Constraints.nonEmptyString;
export const regex = Constraints.regex;
export const noExtraSpace = Constraints.noExtraSpace;
