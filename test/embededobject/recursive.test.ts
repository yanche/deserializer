
import { constraints, fromObject } from "../../index";
import { assert } from "chai";

describe("recursive decorator test", () => {
    it("validation works as expect", () => {
        class C {
            @constraints.max(10)
            field2: number;
        }

        class D {
            @constraints.field
            field1: C;
        }

        assert.throw(() => {
            fromObject({ field1: 10.5 }, D);
        });

        assert.throw(() => {
            fromObject({ field1: {} }, D);
        });

        assert.throw(() => {
            fromObject({ field1: { field2: 11 } }, D);
        });

        assert.throw(() => {
            fromObject({ field1: { field2: "5" } }, D);
        });

        const c = fromObject({ field1: { field2: 10 } }, D);
        assert.strictEqual(c.field1.field2, 10);

        const c2 = fromObject({ field1: { field2: 5 } }, D);
        assert.strictEqual(c2.field1.field2, 5);
    });
});
