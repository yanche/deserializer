import { forType, ConstraintHandler } from "./common";

class Constraints {
    /**
     * To mark the string field as a non empty string.
     */
    @forType({
        type: String,
    })
    public static nonEmptyString(target: any, fieldName: string) {
        Reflect.defineMetadata("nonEmptyString", <ConstraintHandler>{
            validator: (val: string) => {
                return val.trim().length > 0;
            },
            message: "value must be non empty string",
        }, target, fieldName);
    }
}

export const nonEmptyString = Constraints.nonEmptyString;
