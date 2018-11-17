// import { ConstraintValidator } from "../constraints/common";

export const nonEmptyString = {
    name: "nonEmptyString",
    validate: (val: string) => {
        return val.trim().length > 0;
    },
    message: "value must be non empty string",
};
