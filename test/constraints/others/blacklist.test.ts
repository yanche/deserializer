
import { constraints, fromObject } from "../../../index";
import { assert } from "chai";

describe("blacklist decorator test", () => {
    it("input array cannot be empty", () => {
        assert.throw(() => {
            class C {
                @constraints.blacklist([])
                field1: string;
            }
        });
    });

    it("validation works as expect", () => {
        class C {
            @constraints.blacklist(["a", "qqq"])
            field1: string;
        }

        assert.throw(() => {
            fromObject({ field1: "a" }, C);
        });

        assert.throw(() => {
            fromObject({ field1: "qqq" }, C);
        });

        const c = fromObject({ field1: " a " }, C);
        assert.strictEqual(c.field1, " a ");

        const c2 = fromObject({ field1: "d" }, C);
        assert.strictEqual(c2.field1, "d");

        class D {
            @constraints.blacklist([1, 5])
            field1: number;
        }

        assert.throw(() => {
            fromObject({ field1: 5 }, D);
        });
    });
});
