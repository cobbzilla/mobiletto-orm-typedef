import { describe, it } from "mocha";
import { expect, assert } from "chai";
import { MobilettoOrmValidationError, MobilettoOrmTypeDef, rand, nestFields } from "../lib/esm/index.js";

const nestedType1 = new MobilettoOrmTypeDef({
    typeName: `TestType_${rand(10)}`,
    fields: {
        primaryField: { primary: true, tabIndex: 100 },
        otherField: { tabIndex: 0 },
        nestedObject: {
            tabIndex: 50,
            fields: {
                // these fields can be omitted if the entire object is omitted
                // because there is no 'required: true' at the nestedObject-level
                nested1: { required: true },
                nested2: { regex: /[A-Z]+/i },
                triplyNestedObject: {
                    fields: {
                        nested3Plain: { values: [1, 2, 3], tabIndex: 42 },
                        nested3Required: { required: true, tabIndex: 9 },
                    },
                },
            },
        },
    },
});

const nestedType2 = new MobilettoOrmTypeDef({
    typeName: `TestType_${rand(10)}`,
    fields: {
        primaryField: { primary: true },
        otherField: {},
        nestedObject: {
            required: true,
            fields: {
                nested1: { required: true },
                nested2: { regex: /^[A-Z]+$/i },
                triplyNestedObject: {
                    required: true,
                    fields: {
                        nested3Plain: { values: [1, 2, 3] },
                        nested3Required: { required: true },
                    },
                },
            },
        },
    },
});

const nestedObjectArray = new MobilettoOrmTypeDef({
    typeName: `TestType_${rand(10)}`,
    fields: {
        primaryField: { primary: true },
        things: {
            type: "object[]",
            fields: {
                nested1: { required: true, type: "number" },
                nested2: { required: true, type: "string" },
                nested3: { required: false, type: "boolean" },
            },
        },
    },
});

describe("nested validation test with optional nested object with required fields", async () => {
    it("successfully sets tabIndexes for typeDef and all nested objects", async () => {
        expect(nestedType1.tabIndexes.length).eq(3);
        expect(nestedType1.tabIndexes[0]).eq("otherField");
        expect(nestedType1.tabIndexes[1]).eq("nestedObject");
        expect(nestedType1.tabIndexes[2]).eq("primaryField");
        expect(nestedType1.fields.nestedObject.tabIndexes.length).eq(3);
        expect(nestedType1.fields.nestedObject.tabIndexes[0]).eq("nested1");
        expect(nestedType1.fields.nestedObject.tabIndexes[1]).eq("nested2");
        expect(nestedType1.fields.nestedObject.tabIndexes[2]).eq("triplyNestedObject");
        expect(nestedType1.fields.nestedObject.fields.triplyNestedObject.tabIndexes.length).eq(2);
        expect(nestedType1.fields.nestedObject.fields.triplyNestedObject.tabIndexes[0]).eq("nested3Required");
        expect(nestedType1.fields.nestedObject.fields.triplyNestedObject.tabIndexes[1]).eq("nested3Plain");
    });
    it("typeDef.newInstance returns a correct default object with proper nested default objects", async () => {
        const instance = nestedType1.newInstance();
        expect(instance.primaryField).is.undefined;
        expect(instance.otherField).is.undefined;
        expect(instance.nestedObject).is.undefined;
    });
    it("typeDef.newFullInstance returns a correct default full object with proper nested default full objects", async () => {
        const instance = nestedType1.newFullInstance();
        expect(instance.primaryField).eq("");
        expect(instance.otherField).eq("");
        expect(instance.nestedObject.nested1).eq("");
        expect(instance.nestedObject.nested2).eq("");
        expect(instance.nestedObject.triplyNestedObject.nested3Plain).eq(1);
        expect(instance.nestedObject.triplyNestedObject.nested3Required).eq("");
    });
    it("successfully validates an empty object against a typedef with an optional nested object with required fields", async () => {
        const thing = {};
        try {
            const validated = await nestedType1.validate(thing);
            assert.fail(
                `expected nestedType1.validate to throw MobilettoOrmValidationError, but it returned ${validated}`
            );
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected one errors");
            expect(e.errors["primaryField"].length).equals(1, "expected 1 primary error");
            expect(e.errors["primaryField"][0]).equals("required", "expected primary.required error");
        }
    });
});

describe("nested validation test with required nested object with required fields", async () => {
    it("successfully validates an empty object against this complex typedef with a required nested object with required fields", async () => {
        try {
            const validated = await nestedType2.validate({});
            assert.fail(
                `expected nestedType2.validate to throw MobilettoOrmValidationError, but it returned ${validated}`
            );
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(2, "expected two errors");
            expect(e.errors["primaryField"].length).equals(1, "expected 1 primary error");
            expect(e.errors["primaryField"][0]).equals("required", "expected primary.required error");
            expect(e.errors["nestedObject"].length).equals(1, "expected 1 nestedObject error");
            expect(e.errors["nestedObject"][0]).equals("required", "expected nestedObject.required error");
        }
    });
    it("successfully validates an object with an empty nested value against this complex typedef", async () => {
        try {
            const validated = await nestedType2.validate({ nestedObject: {} });
            assert.fail(
                `expected nestedType2.validate to throw MobilettoOrmValidationError, but it returned ${validated}`
            );
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(3, "expected three errors");
            expect(e.errors["primaryField"].length).equals(1, "expected 1 primary error");
            expect(e.errors["primaryField"][0]).equals("required", "expected primary.required error");
            expect(e.errors["nestedObject.nested1"].length).equals(1, "expected 1 nestedObject.nested1 error");
            expect(e.errors["nestedObject.nested1"][0]).equals(
                "required",
                "expected nestedObject.nested1.required error"
            );
            expect(e.errors["nestedObject.triplyNestedObject"].length).equals(
                1,
                "expected 1 nestedObject.triplyNestedObject error"
            );
            expect(e.errors["nestedObject.triplyNestedObject"][0]).equals(
                "required",
                "expected nestedObject.triplyNestedObject.required error"
            );
        }
    });
    it("successfully validates an object with many invalid values against this complex typedef", async () => {
        try {
            const validated = await nestedType2.validate({
                nestedObject: {
                    nested2: "r3g3xFail",
                    triplyNestedObject: {
                        nested3Plain: 42,
                    },
                },
            });
            assert.fail(
                `expected nestedType2.validate to throw MobilettoOrmValidationError, but it returned ${validated}`
            );
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(4, "expected five errors");
            expect(e.errors["primaryField"].length).equals(1, "expected 1 primary error");
            expect(e.errors["primaryField"][0]).equals("required", "expected primary.required error");
            expect(e.errors["nestedObject.nested1"].length).equals(1, "expected 1 nestedObject.nested1 error");
            expect(e.errors["nestedObject.nested1"][0]).equals(
                "required",
                "expected nestedObject.nested1.required error"
            );
            expect(e.errors["nestedObject.nested2"].length).equals(1, "expected 1 nestedObject.nested2 error");
            expect(e.errors["nestedObject.nested2"][0]).equals("regex", "expected nestedObject.nested2.regex error");
            expect(e.errors["nestedObject.triplyNestedObject.nested3Required"].length).equals(
                1,
                "expected 1 nestedObject.triplyNestedObject.nested3Required error"
            );
            expect(e.errors["nestedObject.triplyNestedObject.nested3Required"][0]).equals(
                "required",
                "expected nestedObject.triplyNestedObject.nested3Required.values error"
            );
        }
    });
});

describe("nested validation test with nested array of objects", async () => {
    it("successfully validates when the nested object array is omitted", async () => {
        const primaryFieldValue = `fooPrimary_${Date.now()}`;
        const validated = await nestedObjectArray.validate({ primaryField: primaryFieldValue });
        expect(validated.primaryField).eq(primaryFieldValue);
    });
    it("successfully validates when the nested object array is empty", async () => {
        const primaryFieldValue = `fooPrimary_${Date.now()}`;
        const validated = await nestedObjectArray.validate({ primaryField: primaryFieldValue, things: [] });
        expect(validated.primaryField).eq(primaryFieldValue);
    });
    it("successfully validates when the nested object array contains one valid item", async () => {
        const primaryFieldValue = `fooPrimary_${Date.now()}`;
        const validated = await nestedObjectArray.validate({
            primaryField: primaryFieldValue,
            things: [
                {
                    nested1: 123,
                    nested2: "foo",
                    nested3: true,
                },
            ],
        });
        expect(validated.primaryField).eq(primaryFieldValue);
        expect(validated.things.length).eq(1);
        expect(validated.things[0].nested2).eq("foo");
    });
    it("successfully validates when the nested object array contains two valid items", async () => {
        const primaryFieldValue = `fooPrimary_${Date.now()}`;
        const validated = await nestedObjectArray.validate({
            primaryField: primaryFieldValue,
            things: [
                {
                    nested1: 123,
                    nested2: "foo",
                    nested3: true,
                },
                {
                    nested1: 456,
                    nested2: "bar",
                },
            ],
        });
        expect(validated.primaryField).eq(primaryFieldValue);
        expect(validated.things.length).eq(2);
        expect(validated.things[0].nested2).eq("foo");
        expect(validated.things[1].nested2).eq("bar");
    });
    it("fails validation when the nested object array contains an invalid item", async () => {
        const primaryFieldValue = `fooPrimary_${Date.now()}`;
        try {
            const validated = await nestedObjectArray.validate({
                primaryField: primaryFieldValue,
                things: [
                    {
                        nested1: 123,
                        nested2: "foo",
                        nested3: true,
                    },
                    {
                        nested2: "bar",
                        nested3: "baz",
                    },
                ],
            });
            assert.fail(
                `expected nestedObjectArray.validate to throw MobilettoOrmValidationError, but it returned ${JSON.stringify(
                    validated
                )}`
            );
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(2, "expected two errors");
            expect(e.errors["things[1].nested1"].length).equals(1, "expected 1 things[1].nested1 error");
            expect(e.errors["things[1].nested1"][0]).equals("required", "expected things[1].nested1.required error");
            expect(e.errors["things[1].nested3"].length).equals(1, "expected 1 things[1].nested3 error");
            expect(e.errors["things[1].nested3"][0]).equals("type", "expected things[1].nested3.type error");
        }
    });
    it("fails validation when the nested object array contains two invalid items", async () => {
        const primaryFieldValue = `fooPrimary_${Date.now()}`;
        try {
            const validated = await nestedObjectArray.validate({
                primaryField: primaryFieldValue,
                things: [
                    {
                        nested1: 123,
                        nested3: true,
                    },
                    {
                        nested2: "bar",
                    },
                ],
            });
            assert.fail(
                `expected nestedObjectArray.validate to throw MobilettoOrmValidationError, but it returned ${JSON.stringify(
                    validated
                )}`
            );
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(2, "expected three errors");
            expect(e.errors["things[0].nested2"].length).equals(1, "expected 1 things[0].nested2 error");
            expect(e.errors["things[0].nested2"][0]).equals("required", "expected things[0].nested2.required error");
            expect(e.errors["things[1].nested1"].length).equals(1, "expected 1 things[1].nested1 error");
            expect(e.errors["things[1].nested1"][0]).equals("required", "expected things[1].nested1.required error");
        }
    });
});

const BASE_TOKEN_REGEX = /WORD_\w+/i;

const OTHER_BASE_TYPE_FIELDS = {
    primaryField: { primary: true },
    name: { index: true },
    token: { unique: true, regex: BASE_TOKEN_REGEX },
};

describe("Reuse field configs from a base type in another type's sub-object", async () => {
    it("can define a typedef using a nested array of base type objects by filtering fields", async () => {
        const nestedHasBaseTypeDef = new MobilettoOrmTypeDef({
            typeName: `BaseTestType_${rand(10)}`,
            fields: {
                id: { primary: true },
                things: {
                    type: "object[]",
                    fields: nestFields(OTHER_BASE_TYPE_FIELDS),
                },
            },
        });
        const passesRegex = `WORD_${rand(10)}`;
        expect(passesRegex.match(BASE_TOKEN_REGEX)).is.not.null;
        expect(nestedHasBaseTypeDef).is.not.null;
        expect(nestedHasBaseTypeDef.fields.things.fields.primaryField.primary).is.undefined;
        expect(nestedHasBaseTypeDef.fields.things.fields.name.index).is.undefined;
        expect(nestedHasBaseTypeDef.fields.things.fields.token.unique).is.undefined;
        expect(nestedHasBaseTypeDef.fields.things.fields.token.regex).eq(BASE_TOKEN_REGEX);
    });
});
