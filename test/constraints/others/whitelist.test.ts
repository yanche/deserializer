
import { constraints, fromObject } from "../../../index";
import { assert } from "chai";

describe("whitelist decorator test", () => {
    it("input array cannot be empty", () => {
        assert.throw(() => {
            class C {
                @constraints.whitelist([])
                field1: string;
            }
        });
    });

    it("validation works as expect", () => {
        class C {
            @constraints.whitelist(["a", "qqq"])
            field1: string;
        }

        assert.throw(() => {
            fromObject({ field1: " a " }, C);
        });

        assert.throw(() => {
            fromObject({ field1: "b" }, C);
        });

        const c = fromObject({ field1: "a" }, C);
        assert.strictEqual(c.field1, "a");

        const c2 = fromObject({ field1: "qqq" }, C);
        assert.strictEqual(c2.field1, "qqq");

        class D {
            @constraints.whitelist([1, 5])
            field1: number;
        }

        assert.throw(() => {
            fromObject({ field1: "1" }, D);
        });

        const c3 = fromObject({ field1: 5 }, D);
        assert.strictEqual(c3.field1, 5);
    });
});
