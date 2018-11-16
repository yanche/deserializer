
import { fromObject } from "./index";
import { nonEmptyString, range, field, optional } from "./constraints";


class Config2 {
    @nonEmptyString
    public readonly field1: string;
    @range(-1, 5)
    public readonly field2: number;
}

class Config {
    @nonEmptyString
    public readonly field1: string;
    @range(2, 10)
    public readonly field2: number;
    @field
    public readonly field3: boolean;
    public readonly field4: string[];
    @field
    public readonly embededField: Config2;
    @optional()
    public readonly optNoDefault: string;
    @optional(12)
    public readonly optDefault: number;
}

const result = fromObject<Config>({
    field1: "a",
    field2: 2,
    field3: true,
    field4: 1,
    embededField: {
        field1: "a",
        field2: 3.5,
    },
    optNoDefault: "asd",
    optDefault: 13
}, Config);

console.info(result);
