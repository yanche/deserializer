
import { constraints, fromObject } from "../../../index";
import { assert } from "chai";

describe("min decorator test", () => {
    it("only applies to number field", () => {
        assert.throw(() => {
            class C {
                @constraints.min(10)
                field1: string;
            }
        });
    });

    it("validation works as expect", () => {
        class C {
            @constraints.min(10)
            field1: number;
        }

        assert.throw(() => {
            fromObject({ field1: 9.5 }, C);
        });

        const c = fromObject({ field1: 10 }, C);
        assert.strictEqual(c.field1, 10);
        
        const c2 = fromObject({ field1: 11 }, C);
        assert.strictEqual(c2.field1, 11);
    });
});
