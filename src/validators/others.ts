import { ConstraintValidator } from "../constraints/common";
import { throwIf } from "../common";

export function whitelist<T>(allowedValues: ReadonlyArray<T>): ConstraintValidator {
    throwIf(!allowedValues.length, `invalid input for whitelist, allowedValues must be non-empty`);

    const valuesToString = allowedValues.join("|");
    return {
        name: `whitelist-${valuesToString}`,
        validate: (val: T) => {
            return allowedValues.indexOf(val) >= 0;
        },
        message: `value must be one of ${valuesToString}`,
    };
}

export function blacklist<T>(bannedValues: ReadonlyArray<T>): ConstraintValidator {
    throwIf(!bannedValues.length, `invalid input for blacklist, bannedValues must be non-empty`);

    const valuesToString = bannedValues.join("|");
    return {
        name: `blacklist-${valuesToString}`,
        validate: (val: T) => {
            return bannedValues.indexOf(val) < 0;
        },
        message: `value must be not one of ${valuesToString}`,
    };
}
