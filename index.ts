
import { deserialize } from "./deserialize";

export function fromObject<T>(json: { [key: string]: any }, ctor: new () => T): T {
    return deserialize<T>(json, ctor);
}
