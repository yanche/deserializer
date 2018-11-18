
import { constraints, fromObject } from "../../../index";
import { assert } from "chai";

describe("nonEmptyString decorator test", () => {
    it("only applies to string field", () => {
        assert.throw(() => {
            class C {
                @constraints.nonEmptyString
                field1: number;
            }
        });
    });

    it("validation works as expect", () => {
        class C {
            @constraints.nonEmptyString
            field1: string;
        }

        assert.throw(() => {
            fromObject({ field1: "" }, C);
        });

        assert.throw(() => {
            fromObject({ field1: "  " }, C);
        });

        const c = fromObject({ field1: "a" }, C);
        assert.strictEqual(c.field1, "a");

        const c2 = fromObject({ field1: "  abc " }, C);
        assert.strictEqual(c2.field1, "  abc ");
    });
});
