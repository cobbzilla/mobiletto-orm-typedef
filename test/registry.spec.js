import { describe, it } from "mocha";
import { expect } from "chai";
import {
    MobilettoOrmTypeDef,
    MobilettoOrmTypeDefRegistry,
    MobilettoOrmError,
    MobilettoOrmNotFoundError,
    rand,
} from "../lib/esm/index.js";

describe("type registry test", async () => {
    it("validation fails for a typedef with reference field and no registry", async () => {
        try {
            new MobilettoOrmTypeDef({
                typeName: `TestType_${rand(4)}`,
                fields: {
                    value: { primary: true },
                    other: {
                        ref: {},
                    },
                },
            }).validate({ value: rand(2), other: "foo" });
        } catch (e) {
            expect(e).instanceof(MobilettoOrmError);
        }
    });
    it("validation fails for a typedef with reference field and no registered resolver", async () => {
        const registry = new MobilettoOrmTypeDefRegistry("myReg");
        try {
            new MobilettoOrmTypeDef({
                typeName: `TestType_${rand(4)}`,
                registry,
                fields: {
                    value: { primary: true },
                    other: {
                        ref: {},
                    },
                },
            }).validate({ value: rand(2), other: "foo" });
        } catch (e) {
            expect(e).instanceof(MobilettoOrmError);
        }
    });
    it("validation fails for a typedef with reference field and where the resolver returns null", () => {
        const registry = new MobilettoOrmTypeDefRegistry("myReg");
        registry.register("other", (_id) => null);
        const invalidId = `foo_${rand(2)}`;
        try {
            new MobilettoOrmTypeDef({
                typeName: `TestType_${rand(4)}`,
                registry,
                fields: {
                    value: { primary: true },
                    other: {
                        ref: {},
                    },
                },
            }).validate({ value: rand(2), other: invalidId });
        } catch (e) {
            expect(e).instanceof(MobilettoOrmNotFoundError);
            expect(e.id).eq(invalidId);
        }
    });
    it("validation succeeds for a typedef with a reference field that is resolvable", () => {
        const registry = new MobilettoOrmTypeDefRegistry("myReg");
        registry.register("other", (_id) => ({ someId }));
        const someId = `foo_${rand(2)}`;
        new MobilettoOrmTypeDef({
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
});
