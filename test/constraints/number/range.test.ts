
import { constraints, fromObject } from "../../../index";
import { assert } from "chai";

describe("range decorator test", () => {
    it("only applies to number field", () => {
        assert.throw(() => {
            class C {
                @constraints.range(10, 15)
                field1: string;
            }
        });
    });

    it("invalid range throws", () => {
        assert.throw(() => {
            class C {
                @constraints.range(17, 15)
                field1: number;
            }
        });
    });

    it("equal bounds does not throw", () => {
        class C {
            @constraints.range(17, 17)
            field1: number;
        }
    });

    it("validation works as expect", () => {
        class C {
            @constraints.range(10, 17)
            field1: number;
        }

        assert.throw(() => {
            fromObject({ field1: 9.5 }, C);
        });

        assert.throw(() => {
            fromObject({ field1: 17.5 }, C);
        });

        const c = fromObject({ field1: 10 }, C);
        assert.strictEqual(c.field1, 10);

        const c2 = fromObject({ field1: 12 }, C);
        assert.strictEqual(c2.field1, 12);

        const c3 = fromObject({ field1: 17 }, C);
        assert.strictEqual(c3.field1, 17);
    });
});
