import { describe, it } from "mocha";
import { expect, assert } from "chai";
import {
    ERR_REF_NOT_FOUND,
    MobilettoOrmTypeDef,
    MobilettoOrmTypeDefRegistry,
    MobilettoOrmError,
    MobilettoOrmNotFoundError,
    MobilettoOrmValidationError,
    rand,
} from "../lib/esm/index.js";

describe("typedef registry test", async () => {
    it("validation fails for a typedef with reference field and no registry", async () => {
        try {
            await new MobilettoOrmTypeDef({
                typeName: `TestType_${rand(4)}`,
                fields: {
                    value: { primary: true },
                    other: {
                        ref: {},
                    },
                },
            }).validate({ value: rand(2), other: "foo" });
            assert.fail(`expected MobilettoOrmError for reference field with no registry`);
        } catch (e) {
            expect(e).instanceof(MobilettoOrmError);
        }
    });
    it("validation fails for a typedef with reference field and no registered resolver", async () => {
        const registry = new MobilettoOrmTypeDefRegistry("myReg");
        try {
            await new MobilettoOrmTypeDef({
                typeName: `TestType_${rand(4)}`,
                registry,
                fields: {
                    value: { primary: true },
                    other: {
                        ref: {},
                    },
                },
            }).validate({ value: rand(2), other: "foo" });
            assert.fail(`expected MobilettoOrmError for reference field with no registered resolver`);
        } catch (e) {
            expect(e).instanceof(MobilettoOrmError);
        }
    });
    it("validation fails for a typedef with reference field where the resolver returns null", async () => {
        const registry = new MobilettoOrmTypeDefRegistry("myReg");
        registry.register("other", () => null);
        const invalidId = `foo_${rand(2)}`;
        try {
            await new MobilettoOrmTypeDef({
                typeName: `TestType_${rand(4)}`,
                registry,
                fields: {
                    value: { primary: true },
                    other: {
                        ref: {},
                    },
                },
            }).validate({ value: rand(2), other: invalidId });
            assert.fail(`expected MobilettoOrmError for reference field with resolver that returns null`);
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError);
            expect(e.errors.other[0]).eq(ERR_REF_NOT_FOUND);
        }
    });
    it("validation succeeds for a typedef with a reference field that is resolvable", async () => {
        const registry = new MobilettoOrmTypeDefRegistry("myReg");
        registry.register("other", () => ({ someId }));
        const someId = `foo_${rand(2)}`;
        await new MobilettoOrmTypeDef({
            typeName: `TestType_${rand(4)}`,
            registry,
            fields: {
                value: { primary: true },
                other: {
                    ref: {},
                },
            },
        }).validate({ value: rand(2), other: someId });
    });
    it("validation succeeds for a typedef with a reference field whose value is an array and all values are resolvable", async () => {
        const registry = new MobilettoOrmTypeDefRegistry("myReg");
        registry.register("other", (id) => ({ id }));
        const someId = `foo_${rand(2)}`;
        await new MobilettoOrmTypeDef({
            typeName: `TestType_${rand(4)}`,
            registry,
            fields: {
                value: { primary: true },
                other: {
                    type: "array",
                    control: "multi",
                    values: [0, 1, 2, 3, 4],
                    ref: {},
                },
            },
        }).validate({ value: rand(2), other: [0, 2, 4] });
    });
    it("validation succeeds for a typedef with an alternate refType name", async () => {
        const registry = new MobilettoOrmTypeDefRegistry("myReg");
        registry.register("otherThings", async (id) => ({ id }));
        const someId = `foo_${rand(2)}`;
        await new MobilettoOrmTypeDef({
            typeName: `TestType_${rand(4)}`,
            registry,
            fields: {
                value: { primary: true },
                other: {
                    ref: {
                        refType: "otherThings",
                    },
                },
            },
        }).validate({ value: rand(2), other: rand(3) });
    });
    it("validation fails for a typedef with a reference field whose value is an array and only some values are resolvable", async () => {
        try {
            const registry = new MobilettoOrmTypeDefRegistry("myReg");
            registry.register("other", (id) => (id % 2 === 0 ? null : { id }));
            const someId = `foo_${rand(2)}`;
            const validated = await new MobilettoOrmTypeDef({
                typeName: `TestType_${rand(4)}`,
                registry,
                fields: {
                    value: { primary: true },
                    other: {
                        type: "array",
                        control: "multi",
                        values: [0, 1, 2, 3, 4],
                        ref: {},
                    },
                },
            }).validate({ value: rand(2), other: [0, 1, 2] });
            assert.fail(
                `expected validation failure for reference field with resolver that throws not found: ${JSON.stringify(
                    validated
                )}`
            );
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError);
            expect(e.errors.other.length).eq(1);
            expect(e.errors.other[0]).eq(ERR_REF_NOT_FOUND);
        }
    });
});
