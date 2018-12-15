
import { constraints, fromObject } from "../../../index";
import { assert } from "chai";

describe("noExtraSpace decorator test", () => {
    it("only applies to string field", () => {
        assert.throw(() => {
            class C {
                @constraints.noExtraSpace
                field1: number;
            }
        });
    });

    it("validation works as expect", () => {
        class C {
            @constraints.noExtraSpace
            field1: string;
        }

        assert.throw(() => {
            fromObject({ field1: "  " }, C);
        });

        assert.throw(() => {
            fromObject({ field1: " a" }, C);
        });

        assert.throw(() => {
            fromObject({ field1: "a " }, C);
        });

        assert.throw(() => {
            fromObject({ field1: " abc " }, C);
        });

        const c = fromObject({ field1: "" }, C);
        assert.strictEqual(c.field1, "");

        const c2 = fromObject({ field1: "abc" }, C);
        assert.strictEqual(c2.field1, "abc");
    });
});
