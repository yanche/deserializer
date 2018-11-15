
import "reflect-metadata";
import { fieldsMetadataKey, typeMetadataKey, throwOnFalse, flatten } from "./common";
import { isConstraintHandler } from "./constraints";

export function deserialize<T>(json: { [key: string]: any }, ctor: new () => T): T {
    const innerResult = _deserialize(json, ctor);
    if (innerResult.fieldErrors.every(f => f.errors.length === 0)) {
        return innerResult.result;
    } else {
        throw new Error(`input value does not pass field validation:\n${flatten(innerResult.fieldErrors.map(fieldErrorToStringLines)).join("\n")}`);
    }
}

function _deserialize<T>(json: { [key: string]: any }, ctor: new () => T): {
    fieldErrors: FieldErrors[];
    result: T;
} {
    throwOnFalse(ctor.length === 0, "constructor must takes no input");

    const result = new ctor();
    // get all fields that needs to be deserialized and validated
    const fields: Set<string> = Reflect.getOwnMetadata(fieldsMetadataKey, ctor.prototype);

    const fieldErrors = [...fields].map(fieldName => {
        // field value from raw json
        const fieldVal = json[fieldName];
        // field metadata list, some of them should be the value constraints
        const fieldAttributes: string[] = Reflect.getOwnMetadataKeys(ctor.prototype, fieldName);
        const errorMessages: string[] = [];

        for (let attr of fieldAttributes) {
            const attrVal = Reflect.getOwnMetadata(attr, ctor.prototype, fieldName);
            // TODO, alert to turn on emitDecoratorMetadata if no design:type is found
            if (attr === typeMetadataKey) {
                // if attr is design:type, which every field should have
                if (!validateType(fieldVal, attrVal)) {
                    // TODO, show expected type name here
                    errorMessages.push("value type is incorrect");
                }
            } else if (isConstraintHandler(attrVal)) {
                // check customized validation (field value constraint)
                if (!attrVal.validator(fieldVal)) {
                    errorMessages.push(attrVal.message);
                }
            }
            // else: ignore if metadata is not a constraint handler, it's defined by some other code
        }

        if (errorMessages.length === 0) {
            // assign the validated value
            (<any>result)[fieldName] = fieldVal;
        }

        return {
            fieldName: fieldName,
            errors: errorMessages,
        };
    });

    return {
        fieldErrors: fieldErrors,
        result: result,
    };
}

type FieldErrors = {
    fieldName: string;
    errors: string[];
}

function fieldErrorToStringLines(fieldError: FieldErrors): string[] {
    if (fieldError.errors.length) {
        return [fieldError.fieldName].concat(fieldError.errors.map(e => `    ${e}`));
    } else {
        return [];
    }
}

function validateType(val: any, type: any): boolean {
    switch (type) {
        case String:
            return typeof val === "string";
        case Number:
            return typeof val === "number";
        case Boolean:
            return typeof val === "boolean";
        default:
            // some other constructor function
            return val instanceof type;
    }
}
