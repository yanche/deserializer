
import { constraints, fromObject } from "../../../index";
import { assert } from "chai";

describe("safeInt decorator test", () => {
    it("only applies to number field", () => {
        assert.throw(() => {
            class C {
                @constraints.safeInt
                field1: string;
            }
        });
    });

    it("validation works as expect", () => {
        class C {
            @constraints.safeInt
            field1: number;
        }

        assert.throw(() => {
            // not an integer
            fromObject({ field1: 10.5 }, C);
        });

        assert.throw(() => {
            fromObject({ field1: Number.MAX_SAFE_INTEGER + 1 }, C);
        });
        
        assert.throw(() => {
            fromObject({ field1: Number.MIN_SAFE_INTEGER - 1 }, C);
        });

        const c = fromObject({ field1: 10 }, C);
        assert.strictEqual(c.field1, 10);
    });
});
