
import { fromObject, constraints } from "./index";

class Config2 {
    @constraints.nonEmptyString
    public readonly field1: string;
    @constraints.range(-1, 5)
    public readonly field2: number;
}

class Config {
    @constraints.nonEmptyString
    public readonly field1: string;

    @constraints.safeInt
    @constraints.range(2, 10)
    public readonly field2: number;

    @constraints.field
    public readonly field3: boolean;

    public readonly field4: string[];

    @constraints.field
    public readonly embededField: Config2;

    @constraints.optional()
    public readonly optNoDefault: string;

    @constraints.optional(12)
    public readonly optDefault: number;
}

const result = fromObject<Config>({
    field1: "",
    field2: 2.5,
    field3: true,
    field4: 1,
    embededField: {
        field1: "a",
        field2: 35,
    },
    optNoDefault: "asd",
    optDefault: 13
}, Config);

console.info(result);
