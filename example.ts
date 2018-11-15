
import { Constraints } from "./constraints";
import { fromObject } from "./index";

class Config {
    @Constraints.nonEmptyString
    public readonly field1: string;
    @Constraints.range(2, 10)
    public readonly field2: number;
    @Constraints.field
    public readonly field3: boolean;
    public readonly field4: number;
}

const result = fromObject<Config>({
    field1: "a",
    field2: 3,
    field3: true,
    field4: 1,
}, Config);

console.info(result);
