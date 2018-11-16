import { typeMetadataKey, throwOnFalse } from "../common";
import { field } from "./others";

export type ConstraintHandler = {
    // to process the constraint, validate the input value
    validator: (val: any) => boolean;
    // error message & hint to pass the validation
    message: string;
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
        field(target, fieldName);
        // check validator availability
        throwOnFalse(Reflect.getMetadata(typeMetadataKey, target, fieldName) === expectedType, `constraint ${constraintName} only applies to field type: ${typeName}`);
        // apply validator
        return originalDecoratorFn(target, fieldName);
    }
}
