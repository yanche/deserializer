
import { constraints, fromObject } from "../../../index";
import { assert } from "chai";

describe("regex decorator test", () => {
    it("only applies to string field", () => {
        assert.throw(() => {
            class C {
                @constraints.regex(/abc/)
                field1: number;
            }
        });
    });

    it("validation works as expect", () => {
        class C {
            @constraints.regex(/abc/)
            field1: string;
        }

        assert.throw(() => {
            fromObject({ field1: "" }, C);
        });

        assert.throw(() => {
            fromObject({ field1: "ab" }, C);
        });

        const c = fromObject({ field1: "abc" }, C);
        assert.strictEqual(c.field1, "abc");
    });
});
