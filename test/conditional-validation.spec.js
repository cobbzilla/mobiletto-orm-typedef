import { describe, it } from "mocha";
import { expect, assert } from "chai";
import * as randomstring from "randomstring";
import { MobilettoOrmValidationError, MobilettoOrmTypeDef } from "../lib/esm/index.js";

const rand = (count) => randomstring.generate(count);

const conditionalType = new MobilettoOrmTypeDef({
    typeName: `TestType_${rand(10)}`,
    fields: {
        primaryField: { primary: true },
        selector: { values: [1, 2] },
        nested1: {
            when: (v) => v.selector === 1,
            fields: {
                field1: { required: true },
                field2: { required: true },
            },
        },
        nested2: {
            when: (v) => v.selector === 2,
            fields: {
                field1: { required: true },
                field3: { required: true },
            },
        },
    },
});

describe("validation test with conditionally required nested objects", async () => {
    it("successfully validates an empty object against a typedef with an optional nested object with required fields", async () => {
        try {
            const validated = await conditionalType.validate({});
            assert.fail(
                `expected conditionalType.validate to throw MobilettoOrmValidationError, but it returned ${validated}`
            );
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(2, "expected two errors");
            expect(e.errors["id"].length).equals(1, "expected 1 id error");
            expect(e.errors["id"][0]).equals("required", "expected id.required error");
            expect(e.errors["primaryField"].length).equals(1, "expected 1 primary error");
            expect(e.errors["primaryField"][0]).equals("required", "expected primary.required error");
        }
    });
    it("successfully validates a thing that selects from selector but does not supply any values", async () => {
        try {
            const validated = await conditionalType.validate({
                id: "foo",
                primaryField: "primaryField",
                selector: 1,
            });
            assert.fail(
                `expected conditionalType.validate to throw MobilettoOrmValidationError, but it returned ${validated}`
            );
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected one error");
            expect(e.errors["nested1"].length).equals(1, "expected 1 nested1 error");
            expect(e.errors["nested1"][0]).equals("required", "expected nested1.required error");
        }
    });
    it("successfully validates a thing that selects 1 from selector but does not supply appropriate values", async () => {
        try {
            const validated = await conditionalType.validate({
                id: "foo",
                primaryField: "primaryField",
                selector: 1,
                nested1: {},
            });
            assert.fail(
                `expected conditionalType.validate to throw MobilettoOrmValidationError, but it returned ${validated}`
            );
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(2, "expected two errors");
            expect(e.errors["nested1.field1"].length).equals(1, "expected 1 nested1.field1 error");
            expect(e.errors["nested1.field1"][0]).equals("required", "expected nested1.field1.required error");
            expect(e.errors["nested1.field2"].length).equals(1, "expected 1 nested1.field1 error");
            expect(e.errors["nested1.field2"][0]).equals("required", "expected nested1.field1.required error");
        }
    });
    it("successfully validates a thing that selects 2 from selector but does not supply appropriate values", async () => {
        try {
            const validated = await conditionalType.validate({
                id: "foo",
                primaryField: "primaryField",
                selector: 2,
                nested1: {},
                nested2: {},
            });
            assert.fail(
                `expected conditionalType.validate to throw MobilettoOrmValidationError, but it returned ${validated}`
            );
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(2, "expected two errors");
            expect(e.errors["nested2.field1"].length).equals(1, "expected 1 nested2.field1 error");
            expect(e.errors["nested2.field1"][0]).equals("required", "expected nested2.field1.required error");
            expect(e.errors["nested2.field3"].length).equals(1, "expected 1 nested2.field3 error");
            expect(e.errors["nested2.field3"][0]).equals("required", "expected nested2.field3.required error");
        }
    });
    it("successfully validates a thing that selects 2 from selector and supplies appropriate values", async () => {
        const validated = await conditionalType.validate({
            primaryField: "primaryField",
            selector: 2,
            nested1: {
                field1: "field1",
                field2: "field2",
            },
            nested2: {
                field1: "field1-again",
                field3: "field3",
            },
        });
        expect(validated.nested1).is.undefined;
        expect(validated.nested2.field1).eq("field1-again");
        expect(validated.nested2.field3).eq("field3");
    });
});
