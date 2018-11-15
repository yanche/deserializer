
export const fieldsMetadataKey = "class_fields";
export const typeMetadataKey = "design:type";

export function throwOnFalse(val: boolean, msg: string) {
    if (!val) {
        throw new Error(msg);
    }
}

export function flatten<T>(input: (T | T[])[]): T[] {
    return Array.prototype.concat.apply([], input);
}
