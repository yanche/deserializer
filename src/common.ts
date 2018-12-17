
export const optionalFieldMetadataKey = "optional_field";
export const fieldsMetadataKey = "class_fields";
export const typeMetadataKey = "design:type";

export type OptionalFieldMetadata = {
    hasDefaultVal: boolean;
    defaultVal?: any;
}

export function throwIf(shouldThrow: boolean, msg: string) {
    if (shouldThrow) {
        throw new Error(msg);
    }
}

export function flatten<T>(input: (T | T[])[]): T[] {
    return Array.prototype.concat.apply([], input);
}

export function getPrimitiveTypeName(type: any): "string" | "number" | "boolean" | "" {
    switch (type) {
        case String:
            return "string";
        case Number:
            return "number";
        case Boolean:
            return "boolean";
        default:
            // not primitive type
            return "";
    }
}
