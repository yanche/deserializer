
import { fieldsMetadataKey, typeMetadataKey, throwOnFalse, optionalFieldMetadataKey, OptionalFieldMetadata, getPrimitiveTypeName } from "./common";

export type ConstraintHandler = {
    // to process the constraint, validate the input value
    validator: (val: any) => boolean;
    // error message & hint to pass the validation
    message: string;
}

export function isConstraintHandler(val: any): val is ConstraintHandler {
    return val && val.validator instanceof Function && val.validator.length === 1 && typeof val.message === "string";
}

// a collection of constraints, since some constraints can only apply to certain type of values, like string or number
// define them as a stand along function will need extra line of field type check, like a validation on input values
// benefit of implementing them as class static function is we can leverage the decorator to do this type check for me
// that is called the meta programming of meta programming :)
export class Constraints {
    /**
     * To simply mark the field as de-serialize-able. This is the base of every other field validators, will be called for every field decorator.
     */
    public static field(target: any, fieldName: string) {
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
     * To mark the string field as a non empty string.
     */
    @forType({
        type: String,
        typeName: "string",
    })
    public static nonEmptyString(target: any, fieldName: string) {
        Reflect.defineMetadata("nonEmptyString", {
            validator: (val: string) => {
                return val.trim().length > 0;
            },
            message: "value must be non empty string",
        }, target, fieldName);
    }

    /**
     * To mark the number field with a min value.
     */
    @forType({
        type: Number,
        typeName: "number",
        isFactory: true,
    })
    public static min(minVal: number) {
        return (target: any, fieldName: string) => {
            Reflect.defineMetadata("min", {
                validator: (val: number) => {
                    return val >= minVal;
                },
                message: `value must be greater than or equal to ${minVal}`,
            }, target, fieldName);
        };
    }

    /**
     * To mark the number field with a max value.
     */
    @forType({
        type: Number,
        typeName: "number",
        isFactory: true,
    })
    public static max(maxVal: number) {
        return (target: any, fieldName: string) => {
            Reflect.defineMetadata("max", {
                validator: (val: number) => {
                    return val <= maxVal;
                },
                message: `value must be less than or equal to ${maxVal}`,
            }, target, fieldName);
        };
    }

    /**
     * To mark the number field within a range.
     */
    @forType({
        type: Number,
        typeName: "number",
        isFactory: true,
    })
    public static range(minVal: number, maxVal: number) {
        throwOnFalse(minVal <= maxVal, `invalid input for range ${minVal}-${maxVal}`);

        return (target: any, fieldName: string) => {
            Reflect.defineMetadata("range", {
                validator: (val: number) => {
                    return minVal <= val && val <= maxVal;
                },
                message: `value must be between ${minVal} and ${maxVal}`,
            }, target, fieldName);
        };
    }

    /**
     * To mark the field as optional, with or without a default value.
     */
    public static optional(defaultVal?: any) {
        const hasDefault = arguments.length === 1;
        return (target: any, fieldName: string) => {
            Constraints.field(target, fieldName);

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
}

/**
 * Add field type check to the decorator function. For example min/max value validator is only supposed to apply to number fields.
 * So using them on string will raise error, as long as the decorator itself is processed by this type guard.
 */
export function forType(options: {
    type: any;
    typeName: string;
    isFactory?: boolean;
}) {
    return (_target: any, constraintName: string, descriptor: PropertyDescriptor) => {
        const originalFn: Function = descriptor.value;
        let replaceFn: Function;

        if (options.isFactory) {
            replaceFn = (...args: any[]) => {
                // the decorator function that will be generated with original decorator factory
                const originalFnByFactory = originalFn.apply(undefined, args);
                return proxyDecoratorFnToCheckType(originalFnByFactory, options.type, options.typeName, constraintName);
            };
        } else {
            replaceFn = proxyDecoratorFnToCheckType(<any>originalFn, options.type, options.typeName, constraintName);
        }

        // give the replacement function same name
        Object.defineProperty(replaceFn, "name", {
            value: `${constraintName}(forType${options.isFactory ? "-factory" : ""})`,
            configurable: true,
        });
        descriptor.value = replaceFn;
        return descriptor;
    };
}

function proxyDecoratorFnToCheckType(originalDecoratorFn: (target: any, fieldName: string) => any, expectedType: any, typeName: string, constraintName: string) {
    return (target: any, fieldName: string) => {
        // call the base "field" decorator, to register field
        Constraints.field(target, fieldName);
        // check validator availability
        throwOnFalse(Reflect.getMetadata(typeMetadataKey, target, fieldName) === expectedType, `constraint ${constraintName} only applies to field type: ${typeName}`);
        // apply validator
        return originalDecoratorFn(target, fieldName);
    }
}
