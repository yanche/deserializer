
import { deserialize } from "./deserialize";
import * as constraints from "./constraints";

export function fromObject<T>(obj: { [key: string]: any }, ctor: new () => T): T {
    return deserialize<T>(obj, ctor);
}

export function fromJson<T>(json: string, ctor: new () => T): T {
    let objFromJson: any = null;
    try {
        objFromJson = JSON.parse(json);
    }
    catch (err) {
        throw new Error("input json is invalid");
    }
    return fromObject<T>(objFromJson, ctor);
}

export { constraints };
