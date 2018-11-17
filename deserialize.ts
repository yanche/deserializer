
import "reflect-metadata";
import { optionalFieldMetadataKey, OptionalFieldMetadata, fieldsMetadataKey, typeMetadataKey, throwOnFalse, flatten, getPrimitiveTypeName } from "./common";
import { isConstraintValidator } from "./constraints";

export function deserialize<T>(json: { [key: string]: any }, ctor: new () => T): T {
    const innerResult = _deserialize(json, ctor);
    if (innerResult.fieldErrors.length === 0) {
        return innerResult.result;
    } else {
        throw new Error(`input value does not pass validation:\n${flatten(innerResult.fieldErrors.map(fieldErrorToStringLines)).join("\n")}`);
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
        let fieldRawVal = json[fieldName];

        if (!(<Object>json).hasOwnProperty(fieldName)) {
            // if field does not exist in source json, throw on required field, use default value for optional field
            if (Reflect.hasOwnMetadata(optionalFieldMetadataKey, ctor.prototype, fieldName)) {
                // optional field
                const { defaultVal, hasDefaultVal } = <OptionalFieldMetadata>Reflect.getOwnMetadata(optionalFieldMetadataKey, ctor.prototype, fieldName);
                if (hasDefaultVal) {
                    fieldRawVal = defaultVal;
                } else {
                    // skip this field
                    return null;
                }
            } else {
                // required field
                return {
                    fieldName: fieldName,
                    errors: ["required field does not exist in source json"],
                };
            }
        }

        const fieldType = Reflect.getOwnMetadata(typeMetadataKey, ctor.prototype, fieldName);
        const { error: typeError, fieldVal: fieldVal } = validateValueType(fieldRawVal, fieldType);
        if (typeError) {
            // emit type error
            return {
                fieldName: fieldName,
                errors: typeof typeError === "string" ? [typeError] : typeError,
            };
        }

        // at this point, type is good & embeded json deserialization is done, go ahead and validate other constraints

        // field metadata list, some of them should be the value constraints
        const fieldAttributes: string[] = Reflect.getOwnMetadataKeys(ctor.prototype, fieldName).filter(t => t !== typeMetadataKey);
        const errorMessages: string[] = [];

        for (const attr of fieldAttributes) {
            const attrVal = Reflect.getOwnMetadata(attr, ctor.prototype, fieldName);
            if (isConstraintValidator(attrVal)) {
                // check customized validation (field value constraint)
                if (!attrVal.validate(fieldVal)) {
                    errorMessages.push(attrVal.message);
                }
            }
            // else: ignore if metadata is not a constraint handler, it's defined by some other code
        }

        if (errorMessages.length === 0) {
            // no constraint error, all good
            // assign the validated value
            (<any>result)[fieldName] = fieldVal;
            return null;
        } else {
            return {
                fieldName: fieldName,
                errors: errorMessages,
            };
        }
    });

    return {
        fieldErrors: fieldErrors.filter(t => !!t),
        result: result,
    };
}

function validateValueType(fieldRawVal: any, fieldType: any): {
    // string: field error, FieldErrors[]: inner fields error
    error?: string | FieldErrors[];
    fieldVal?: any;
} {
    // if attr is design:type, which every field should have
    const primTypeName = getPrimitiveTypeName(fieldType);
    if (primTypeName) {
        // fieldType is 1 of 3 primitive types
        if (typeof fieldRawVal !== primTypeName) {
            return { error: `value type is incorrect, ${primTypeName} is expected` };
        } else {
            return { fieldVal: fieldRawVal };
        }
    } else if ([Object, Array, Function, undefined].some(t => t === fieldType)) {
        throw new Error("defensive code, impossible code path, unallowed fields: plain-object/array/function/void should already been checked at decorating stage");
    } else {
        // field type is object, do recursive deserialization
        if (fieldRawVal instanceof Object) {
            const embededResult = _deserialize(fieldRawVal, fieldType);
            if (embededResult.fieldErrors.length > 0) {
                return { error: embededResult.fieldErrors };
            } else {
                return { fieldVal: embededResult.result };
            }
        } else {
            return { error: `value type is incorrect, object is expected` };
        }
    }
}

type FieldErrors = {
    fieldName: string;
    // if the field value is not a primitive, like object or array
    // then the "errors" will be an array of FieldErrors
    errors: string[] | FieldErrors[];
}

function fieldErrorToStringLines(fieldErrors: FieldErrors): string[] {
    const errors = fieldErrors.errors;
    return [fieldErrors.fieldName + ":"].concat(flatten((<(string | FieldErrors)[]>errors).map(e => {
        return typeof e === "string" ? e : fieldErrorToStringLines(e);
    })).map(e => `${indent}${e}`));
}

const indent = "    ";
