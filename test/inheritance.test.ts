
import { constraints, fromObject } from "../index";
import { assert } from "chai";

describe("inheritance decorator test", () => {
    it("validation works on both derived and base class", () => {
        class Base {
            @constraints.max(10)
            field2: number;
        }

        class Derived extends Base {
            @constraints.min(10)
            field1: number;
        }

        // miss property from Base
        assert.throw(() => {
            fromObject({ field1: 12 }, Derived);
        });

        // miss property from Derived
        assert.throw(() => {
            fromObject({ field2: 5 }, Derived);
        });

        assert.throw(() => {
            fromObject({ field1: 8, field2: 5 }, Derived);
        });

        assert.throw(() => {
            fromObject({ field1: 12, field2: 50 }, Derived);
        });

        const c = fromObject({ field1: 81, field2: 5 }, Derived);
        assert.strictEqual(c.field1, 81);
        assert.strictEqual(c.field2, 5);
    });

    it("property in derived class will cover those from base class", () => {
        class Base {
            @constraints.max(10)
            field1: number;
        }

        class Derived extends Base {
            @constraints.min(20)
            field1: number;
        }

        // raise error if using derived class
        assert.throw(() => {
            fromObject({ field1: 1 }, Derived);
        });
        
        // pass if using base class
        const c1 = fromObject({ field1: 1 }, Base);
        assert.strictEqual(c1.field1, 1);

        // raise error if using base class
        assert.throw(() => {
            fromObject({ field1: 30 }, Base);
        });

        // pass if using derived class
        const c2 = fromObject({ field1: 30 }, Derived);
        assert.strictEqual(c2.field1, 30);
    });
});
