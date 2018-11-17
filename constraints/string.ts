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
}

export const nonEmptyString = Constraints.nonEmptyString;
