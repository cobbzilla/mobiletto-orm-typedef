import { describe, it } from "mocha";
import { expect, assert } from "chai";
import { MobilettoOrmValidationError, MobilettoOrmTypeDef, rand } from "../lib/esm/index.js";

const typeDefConfig = {
    typeName: `TestType_${rand(10)}`,
    validations: {
        must_sum_to_100: {
            field: "global",
            valid: (v) => (v.slice1 ?? 0) + (v.slice2 ?? 0) === 100,
        },
        slice1_last_digit_3: {
            field: "slice1",
            valid: (v) => {
                return (v.slice1 ?? 0) % 10 !== 3;
            },
            error: "invalid",
        },
    },
    fields: {
        name: { primary: true },
        slice1: { type: "number", minValue: 0, maxValue: 100 },
        slice2: { type: "number", minValue: 0, maxValue: 100 },
    },
};

const asyncErrorConfig = {
    typeName: `TestType_${rand(10)}`,
    validations: {
        async_validation_that_throws_error: {
            field: "value",
            valid: async (v) => {
                if (v.value === 0) throw TypeError;
                return v.value === 1;
            },
            error: "invalid",
        },
    },
    fields: {
        name: { primary: true },
        value: { type: "number" },
    },
};

describe("typedef validation test", async () => {
    it("typeDef.isId returns true for a valid id", async () => {
        const typeDef = new MobilettoOrmTypeDef(typeDefConfig);
        expect(typeDef.isId(typeDef.newId())).to.be.true;
    });
    it("typeDef.isId returns false for an invalid id", async () => {
        const typeDef = new MobilettoOrmTypeDef(typeDefConfig);
        expect(typeDef.isId(typeDef.newId() + "0")).to.be.false;
    });
    it("typeDef.isVersion returns true for a valid version", async () => {
        const typeDef = new MobilettoOrmTypeDef(typeDefConfig);
        expect(typeDef.isVersion(typeDef.newVersion())).to.be.true;
    });
    it("typeDef.isVersion returns false for an invalid version", async () => {
        const typeDef = new MobilettoOrmTypeDef(typeDefConfig);
        expect(typeDef.isVersion(typeDef.newVersion() + "0")).to.be.false;
    });
    it("successfully validates with multiple typedef validation errors", async () => {
        const typeDef = new MobilettoOrmTypeDef(typeDefConfig);
        try {
            const validated = await typeDef.validate({
                name: "foo",
                slice1: 13,
                slice2: 11,
            });
            assert.fail(`expected validate to throw MobilettoOrmValidationError, but it returned ${validated}`);
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError);
            expect(Object.keys(e.errors).length).equals(2, "expected two errors");
            expect(e.errors["slice1"].length).equals(1, "expected 1 slice1 error");
            expect(e.errors["slice1"][0]).equals("invalid", "expected slice1.invalid error");
            expect(e.errors["global"].length).equals(1, "expected 1 global error");
            expect(e.errors["global"][0]).equals("must_sum_to_100", "expected global.must_sum_to_100 error");
        }
    });
    it("successfully validates even when async validator throws an error", async () => {
        const typeDef = new MobilettoOrmTypeDef(asyncErrorConfig);
        try {
            const validated = await typeDef.validate({
                name: "foo",
                value: 0,
            });
            assert.fail(`expected validate to throw MobilettoOrmValidationError, but it returned ${validated}`);
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError);
            expect(Object.keys(e.errors).length).equals(1, "expected one error");
            expect(e.errors["value"].length).equals(1, "expected 1 value error");
            expect(e.errors["value"][0]).equals("invalid", "expected value.invalid error");
        }
    });
    it("successfully validates when async validator return false", async () => {
        const typeDef = new MobilettoOrmTypeDef(asyncErrorConfig);
        try {
            const validated = await typeDef.validate({
                name: "foo",
                value: 3,
            });
            assert.fail(`expected validate to throw MobilettoOrmValidationError, but it returned ${validated}`);
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError);
            expect(Object.keys(e.errors).length).equals(1, "expected one error");
            expect(e.errors["value"].length).equals(1, "expected 1 value error");
            expect(e.errors["value"][0]).equals("invalid", "expected value.invalid error");
        }
    });
    it("successfully validates when async validator return true", async () => {
        const typeDef = new MobilettoOrmTypeDef(asyncErrorConfig);
        await typeDef.validate({
            name: "foo",
            value: 1,
        });
    });
    it("successfully allows typeDef extension to override field definitions", async () => {
        const typeDef = new MobilettoOrmTypeDef(asyncErrorConfig);
        const extended = typeDef.extend({
            fields: {
                value: { control: "hidden" },
            },
        });
        expect(typeDef.fields.value.control).eq("text");
        expect(extended.fields.value.control).eq("hidden");
        expect(typeDef.tabIndexedFields().find((f) => f.name === "value").control).eq("text");
        expect(extended.tabIndexedFields().find((f) => f.name === "value").control).eq("hidden");
    });
});
