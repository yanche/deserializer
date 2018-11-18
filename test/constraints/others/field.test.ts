
import { constraints, fromObject } from "../../../index";
import { assert } from "chai";

describe("field decorator test", () => {
    it("applies to string|number|boolean field", () => {
        class C {
            @constraints.field
            field1: string;
            @constraints.field
            field2: boolean;
            @constraints.field
            field3: number;
        }
    });

    it("applies to sub-class field", () => {
        class SubC {
            @constraints.field
            field1: string;
        }

        class C {
            @constraints.field
            field2: SubC;
        }
    });

    it("not applies to array|void field", () => {
        assert.throw(() => {
            class C1 {
                @constraints.field
                field1: void;
            }
        });

        assert.throw(() => {
            class C2 {
                @constraints.field
                field1: string[];
            }
        });
    });


    it("validation works as expect", () => {
        class C {
            @constraints.field
            field1: string;
            @constraints.field
            field2: boolean;
            @constraints.field
            field3: number;
        }

        const c = fromObject({ field1: "a", field2: true, field3: 123 }, C);
        assert.strictEqual(c.field1, "a");
        assert.strictEqual(c.field2, true);
        assert.strictEqual(c.field3, 123);
    });
});
