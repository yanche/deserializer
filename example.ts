
import { Constraints } from "./constraints";
import { fromObject } from "./index";


class Config2 {
    @Constraints.nonEmptyString
    public readonly field1: string;
    @Constraints.range(-1, 5)
    public readonly field2: number;
}

class Config {
    @Constraints.nonEmptyString
    public readonly field1: string;
    @Constraints.range(2, 10)
    public readonly field2: number;
    @Constraints.field
    public readonly field3: boolean;
    public readonly field4: number;
    @Constraints.field
    public readonly embededField: Config2;
}

const result = fromObject<Config>({
    field1: "a",
    field2: 2,
    field3: true,
    field4: 1,
    embededField: {
        field1: "a",
        field2: 35,
    }
}, Config);

console.info(result);
