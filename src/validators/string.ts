
import { ConstraintValidator } from "../constraints/common";

export const nonEmptyString = {
    name: "nonEmptyString",
    validate: (val: string) => {
        return val.trim().length > 0;
    },
    message: "value must be non empty string",
};

export function regex(regex: RegExp): ConstraintValidator {
    return {
        name: `regex-${regex.source}`,
        validate: (val: string) => {
            return regex.test(val);
        },
        message: `value must match regex: ${regex.source}`,
    };
}
