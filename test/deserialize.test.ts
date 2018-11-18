
import { constraints, fromObject } from "../index";
import { assert } from "chai";

describe("deserialize test", () => {
    it("class constructor must take no input", () => {
        class C {
            @constraints.field
            field1: string;

            constructor(field1: string) {
                this.field1 = field1;
            }
        }

        assert.throw(() => {
            fromObject({ field1: "abc" }, <any>C);
        });
    });

    it("field value mismatch throws", () => {
        class C {
            @constraints.field
            field1: string;
        }

        assert.throw(() => {
            fromObject({ field1: 123 }, C);
        });
    });

    it("field not found throws", () => {
        class C {
            @constraints.field
            field1: string;
        }

        assert.throw(() => {
            fromObject({ field2: "123" }, C);
        });
    });

    it("embeded object validation", () => {
        class SubC {
            @constraints.nonEmptyString
            field1: string;
        }

        class C {
            @constraints.field
            field2: SubC;
        }

        assert.throw(() => {
            fromObject({ field2: { field1: "" } }, C);
        });
    });

    it("input not an object throws", () => {
        class C {
            @constraints.field
            field1: string;
        }

        assert.throw(() => {
            fromObject(<any>"abc", C);
        });
    });
});
