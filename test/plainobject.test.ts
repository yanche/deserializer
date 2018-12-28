
import { constraints, fromObject } from "../index";
import { assert } from "chai";

describe("plain object decorator test", () => {
    it("validation works as expect", () => {
        class D {
            @constraints.field
            field1: { [key: string]: string };
        }

        assert.throw(() => {
            fromObject({ field1: 10.5 }, D);
        });

        assert.throw(() => {
            fromObject({ field1: "something" }, D);
        });

        const c = fromObject({ field1: { field2: 10 } }, D);
        assert.strictEqual(<any>c.field1.field2, 10);

        const c2 = fromObject({ field1: { field2: "5" } }, D);
        assert.strictEqual(c2.field1.field2, "5");

        const c3 = fromObject({ field1: {} }, D);
        assert.strictEqual(JSON.stringify(c3.field1), "{}");

        const c4 = fromObject({ field1: { field2: { field3: "abc" } } }, D);
        assert.strictEqual((<any>c4.field1.field2).field3, "abc");
    });
});
