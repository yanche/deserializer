
import { constraints, fromObject } from "../../../index";
import { assert } from "chai";

describe("optional decorator test", () => {
    it("applies to string|number|boolean optional", () => {
        class C {
            @constraints.optional()
            optional1: string;
            @constraints.optional()
            optional2: boolean;
            @constraints.optional()
            optional3: number;
        }
    });

    it("applies to sub-class optional", () => {
        class SubC {
            @constraints.field
            optional1: string;
        }

        class C {
            @constraints.optional()
            optional2: SubC;
        }
    });

    it("not applies to array|void optional", () => {
        assert.throw(() => {
            class C1 {
                @constraints.optional()
                optional1: void;
            }
        });

        assert.throw(() => {
            class C2 {
                @constraints.optional()
                optional1: string[];
            }
        });
    });

    it("default value type not same as field type", () => {
        assert.throw(() => {
            class C {
                @constraints.optional("abc")
                optional1: number;
            }
        });
    });

    it("default value works as expect", () => {
        class C {
            @constraints.optional("abc")
            optional1: string;
            @constraints.optional(true)
            optional2: boolean;
            @constraints.optional(12)
            optional3: number;
        }

        const c = fromObject({}, C);
        assert.strictEqual(c.optional1, "abc");
        assert.strictEqual(c.optional2, true);
        assert.strictEqual(c.optional3, 12);
    });

    it("default overwrite value works as expect", () => {
        class C {
            @constraints.optional("abc")
            optional1: string;
            @constraints.optional(true)
            optional2: boolean;
            @constraints.optional(12)
            optional3: number;
        }

        const c = fromObject({ optional1: "aaa", optional2: false, optional3: 1 }, C);
        assert.strictEqual(c.optional1, "aaa");
        assert.strictEqual(c.optional2, false);
        assert.strictEqual(c.optional3, 1);
    });

    it("no default value fields works as expect", () => {
        class C {
            @constraints.optional()
            optional1: string;
            @constraints.optional()
            optional2: boolean;
            @constraints.optional()
            optional3: number;
            @constraints.optional()
            optional4: string;
            @constraints.optional()
            optional5: boolean;
            @constraints.optional()
            optional6: number;
        }

        const c = fromObject({ optional1: "a", optional2: true, optional3: 123 }, C);
        assert.strictEqual(c.optional1, "a");
        assert.strictEqual(c.optional2, true);
        assert.strictEqual(c.optional3, 123);
        assert.strictEqual(c.optional4, undefined);
        assert.strictEqual(c.optional5, undefined);
        assert.strictEqual(c.optional6, undefined);
        assert.deepStrictEqual(Object.getOwnPropertyNames(c), ["optional1", "optional2", "optional3"]);
    });

    it("should skip other validation if default value not provided", () => {
        class C {
            @constraints.whitelist(["a", "b"])
            @constraints.optional()
            optional4: string;
            @constraints.whitelist([true])
            @constraints.optional()
            optional5: boolean;
            @constraints.whitelist([1, 2, 3])
            @constraints.optional()
            optional6: number;
        }

        const c = fromObject({}, C);
        assert.strictEqual(c.optional4, undefined);
        assert.strictEqual(c.optional5, undefined);
        assert.strictEqual(c.optional6, undefined);
        assert.deepStrictEqual(Object.getOwnPropertyNames(c), []);
    });

    it("should apply other validation if default value is provided", () => {
        class C1 {
            @constraints.nonEmptyString
            @constraints.optional("")
            optional1: string;
        }

        class C2 {
            @constraints.blacklist([false])
            @constraints.optional(false)
            optional2: boolean;
        }

        class C3 {
            @constraints.min(5)
            @constraints.optional(1)
            optional3: number;
        }

        assert.throw(() => fromObject({}, C1));
        assert.throw(() => fromObject({}, C2));
        assert.throw(() => fromObject({}, C3));

        const c1 = fromObject({ optional1: "a" }, C1);
        assert.strictEqual(c1.optional1, "a");

        const c2 = fromObject({ optional2: true }, C2);
        assert.strictEqual(c2.optional2, true);

        const c3 = fromObject({ optional3: 6 }, C3);
        assert.strictEqual(c3.optional3, 6);
    });

    it("sub-class field default value works as expect", () => {
        class SubC {
            @constraints.field
            field1: string;
        }

        const defaultV = new SubC();
        defaultV.field1 = "abc";

        class C {
            @constraints.optional(defaultV)
            optional1: SubC;
        }

        const c = fromObject({}, C);
        assert.notStrictEqual(c.optional1, defaultV);
        assert.strictEqual(c.optional1.field1, "abc");
    });

    it("sub-class field default value overwrite works as expect", () => {
        class SubC {
            @constraints.field
            field1: string;
        }

        const defaultV = new SubC();
        defaultV.field1 = "abc";

        class C {
            @constraints.optional(defaultV)
            optional1: SubC;
        }

        const c = fromObject({ optional1: { field1: "qqq" } }, C);
        assert.notStrictEqual(c.optional1, defaultV);
        assert.strictEqual(c.optional1.field1, "qqq");
    });
});
