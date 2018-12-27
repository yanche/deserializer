import { typeMetadataKey, fieldsMetadataKey, getPrimitiveTypeName, optionalFieldMetadataKey, OptionalFieldMetadata } from "../common";
import * as otherValidators from "../validators/others";

export function field(target: any, fieldName: string) {
    // check ts option to emit metadata is on
    if (!Reflect.hasOwnMetadata(typeMetadataKey, target, fieldName)) {
        throw new Error("to use metadata for fields validation, please turn on emitDecoratorMetadata and experimentalDecorators as ts compiler option");
    }

    // check type field is acceptable (array & function is not allowed at this moment)
    const fieldType = Reflect.getOwnMetadata(typeMetadataKey, target, fieldName);
    if ([Object, Array, Function, undefined].some(t => t === fieldType)) {
        throw new Error(`${fieldName}: plain-object, array, function and void are not allowed at this moment as field type`);
    }

    // put the metadata class_fields, so that we have a list of validate-able fields
    if (!Reflect.hasOwnMetadata(fieldsMetadataKey, target)) {
        // first time calling, create the fields set
        Reflect.defineMetadata(fieldsMetadataKey, new Set<string>(), target);
    }
    const fields: Set<string> = Reflect.getOwnMetadata(fieldsMetadataKey, target);
    fields.add(fieldName);
}

/**
 * To mark the field as optional, with or without a default value.
 */
export function optional(defaultVal?: any) {
    const hasDefault = arguments.length === 1;
    return (target: any, fieldName: string) => {
        field(target, fieldName);

        if (hasDefault) {
            const fieldType = Reflect.getOwnMetadata(typeMetadataKey, target, fieldName);
            const fieldPrimTypeName = getPrimitiveTypeName(fieldType);
            if (typeof defaultVal !== fieldPrimTypeName && !(defaultVal instanceof fieldType)) {
                throw new Error(`${fieldName}: default value must be the same type as field`);
            }
        }

        Reflect.defineMetadata(optionalFieldMetadataKey, <OptionalFieldMetadata>{
            hasDefaultVal: hasDefault,
            defaultVal: defaultVal,
        }, target, fieldName);
    };
}

/**
 * To mark the field only accepts certain values.
 */
export function whitelist<T>(allowedValues: T[]) {
    const validator = otherValidators.whitelist(allowedValues);
    return (target: any, fieldName: string) => {
        field(target, fieldName);
        Reflect.defineMetadata(validator.name, validator, target, fieldName);
    };
}

/**
 * To mark the field does not accept certain values.
 */
export function blacklist<T>(bannedValues: T[]) {
    const validator = otherValidators.blacklist(bannedValues);
    return (target: any, fieldName: string) => {
        field(target, fieldName);
        Reflect.defineMetadata(validator.name, validator, target, fieldName);
    };
}
