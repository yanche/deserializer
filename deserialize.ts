
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
    throwOnFalse(json instanceof Object, "json input must be an object or array");

    const result = new ctor();
    // get all fields that needs to be deserialized and validated
    const fields: Set<string> = Reflect.getOwnMetadata(fieldsMetadataKey, ctor.prototype);

    const fieldErrors = [...fields].map(fieldName => {
        // field value from raw json
        if (!(<Object>json).hasOwnProperty(fieldName)) {
            return {
                fieldName: fieldName,
                errors: ["field does not exist in source json"],
            };
        }

        let fieldVal = json[fieldName];
        // field metadata list, some of them should be the value constraints
        const fieldAttributes: string[] = Reflect.getOwnMetadataKeys(ctor.prototype, fieldName);
        const errorMessages: string[] = [];

        for (let attr of fieldAttributes) {
            const attrVal = Reflect.getOwnMetadata(attr, ctor.prototype, fieldName);
            // TODO, alert to turn on emitDecoratorMetadata if no design:type is found
            if (attr === typeMetadataKey) {
                // if attr is design:type, which every field should have
                if (isPrimitiveType(attrVal)) {
                    if (!validatePrimitiveType(fieldVal, attrVal)) {
                        // TODO, show expected type name here
                        errorMessages.push("value type is incorrect");
                    }
                } else {
                    // field type is an embeded object, do recursive deserialization
                    if (fieldVal instanceof Object) {
                        const embededResult = _deserialize(fieldVal, attrVal);
                        // merge embeded field errors
                        for (let embededFieldError of embededResult.fieldErrors) {
                            if (embededFieldError.errors.length) {
                                errorMessages.push(`${embededFieldError.fieldName}: `);
                                embededFieldError.errors.forEach(e => errorMessages.push(`    ${e}`));
                            }
                        }
                        fieldVal = embededResult.result;
                    } else {
                        errorMessages.push("for embeded field, the json value must be an object");
                    }
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
        return [fieldError.fieldName + ":"].concat(fieldError.errors.map(e => `    ${e}`));
    } else {
        return [];
    }
}

function isPrimitiveType(type: any): boolean {
    return [String, Number, Boolean].some(t => t === type);
}

function validatePrimitiveType(val: any, type: any): boolean {
    switch (type) {
        case String:
            return typeof val === "string";
        case Number:
            return typeof val === "number";
        case Boolean:
            return typeof val === "boolean";
        default:
            return false;
    }
}
