import { describe, it } from "mocha";
import { expect } from "chai";
import { MobilettoOrmValidationError, MobilettoOrmTypeDef, rand, fsSafeName } from "../lib/esm/index.js";

const SOME_DEFAULT_VALUE = rand(10);

const ALPHA_STRING = "AbCdEfGh";

const NOT_REQUIRED_MIN_LEN = 10;

const typeDef = new MobilettoOrmTypeDef({
    typeName: `TestType_${rand(10)}`,
    fields: {
        value: {
            required: true,
            min: 20,
            max: 100,
            updatable: false,
        },
        int: {
            minValue: -3,
            maxValue: 500,
            tabIndex: 10,
        },
        comments: {
            control: "textbox",
        },
        alphaOnly: {
            control: "password",
            regex: /^[A-Z]+$/gi,
            tabIndex: 20,
        },
        defaultableField: {
            required: true,
            default: SOME_DEFAULT_VALUE,
        },
        impliedBoolean: {
            default: false,
            tabIndex: -1,
        },
        restricted: {
            values: [1, 2, 3],
        },
        multiselect: {
            // type: "array",
            control: "multi",
            values: ["option-1", "option-2", "option-3", "option-4"],
            test: {
                message: "not-option-2",
                valid: (v) => {
                    return !v.multiselect.includes("option-2");
                },
            },
        },
        notRequiredButHasMin: {
            type: "string",
            required: false,
            min: NOT_REQUIRED_MIN_LEN,
        },
        multistring: {
            type: "string[]",
        },
    },
});

describe("validation test", async () => {
    it("each field has the correct types and controls", async () => {
        const fieldDefs = typeDef.fields;
        expect(fieldDefs["value"].type).eq("string");
        expect(fieldDefs["value"].control).eq("text");
        expect(fieldDefs["int"].type).eq("number");
        expect(fieldDefs["int"].control).eq("range");
        expect(fieldDefs["comments"].type).eq("string");
        expect(fieldDefs["comments"].control).eq("textbox");
        expect(fieldDefs["alphaOnly"].type).eq("string");
        expect(fieldDefs["alphaOnly"].control).eq("password");
        expect(fieldDefs["defaultableField"].type).eq("string");
        expect(fieldDefs["defaultableField"].control).eq("text");
        expect(fieldDefs["impliedBoolean"].type).eq("boolean");
        expect(fieldDefs["impliedBoolean"].control).eq("flag");
        expect(fieldDefs["restricted"].type).eq("number");
        expect(fieldDefs["restricted"].control).eq("select");
        expect(fieldDefs["multiselect"].type).eq("string[]");
        expect(fieldDefs["multiselect"].control).eq("multi");
        expect(fieldDefs["multistring"].type).eq("string[]");
        expect(fieldDefs["multistring"].control).eq("text");
    });
    it("typeDef.tabIndexes returns the field names in the correct order", async () => {
        const ti = typeDef.tabIndexes;
        expect(ti.length).eq(Object.keys(typeDef.fields).length);
        expect(ti[0]).eq("impliedBoolean");
        expect(ti[1]).eq("int");
        expect(ti[2]).eq("alphaOnly");
        expect(ti[3]).eq("value");
        expect(ti[4]).eq("comments");
        expect(ti[5]).eq("defaultableField");
        expect(ti[6]).eq("restricted");
        expect(ti[7]).eq("multiselect");
        expect(ti[8]).eq("notRequiredButHasMin");
    });
    it("typeDef.newInstance returns a correct default object", async () => {
        const instance = typeDef.newInstance();
        expect(instance.value).is.undefined;
        expect(instance.int).is.undefined;
        expect(instance.comments).is.undefined;
        expect(instance.alphaOnly).is.undefined;
        expect(instance.defaultableField).eq(SOME_DEFAULT_VALUE);
        expect(instance.impliedBoolean).eq(false);
        expect(instance.restricted).is.undefined;
        expect(instance.multiselect).is.undefined;
    });
    it("typeDef.newFullInstance returns a correct default full object", async () => {
        const instance = typeDef.newFullInstance();
        expect(instance.value).eq("");
        expect(instance.int).eq(0);
        expect(instance.comments).eq("");
        expect(instance.alphaOnly).eq("");
        expect(instance.defaultableField).eq(SOME_DEFAULT_VALUE);
        expect(instance.impliedBoolean).eq(false);
        expect(instance.restricted).eq(1);
        expect(instance.multiselect.length).eq(0);
    });
    it("typeDef.newDummyInstance returns a correct dummy object", async () => {
        const instance = typeDef.newDummyInstance();
        expect(instance.value.length).greaterThan(0);
        expect(instance.int).greaterThan(0);
        expect(instance.comments.length).greaterThan(0);
        expect(instance.alphaOnly.length).greaterThan(0);
        expect(instance.defaultableField).eq(SOME_DEFAULT_VALUE);
        // expect(instance.impliedBoolean).eq(false) // could be true or false, nothing to test
        expect(instance.restricted).eq(1);
        expect(instance.multiselect.length).eq(0);
    });
    it("fails to validate an object without any required fields", async () => {
        try {
            await typeDef.validate({});
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected one error");
            expect(e.errors["value"].length).equals(1, "expected 1 value error");
            expect(e.errors["value"][0]).equals("required", "expected value.required error");
        }
    });
    it("fails to validate an object with a custom-validated field", async () => {
        try {
            await typeDef.validate({ multiselect: ["option-2"] });
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(2, "expected one error");
            expect(e.errors["value"].length).equals(1, "expected 1 value error");
            expect(e.errors["value"][0]).equals("required", "expected value.required error");
            expect(e.errors["multiselect"].length).equals(1, "expected 1 multiselect error");
            expect(e.errors["multiselect"][0]).equals("not-option-2", "expected multiselect.not-option-2 error");
        }
    });
    it("fails to validate an object with an illegal id and without one required field", async () => {
        const thing = { id: "%" + rand(10) };
        try {
            await typeDef.validate(thing);
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected 1 error");
            expect(e.errors["value"].length).equals(1, "expected 1 value error");
            expect(e.errors["value"][0]).equals("required", "expected value.required error");
            expect(thing._meta.id).eq(fsSafeName(thing.id)); // id was correctly assigned
        }
    });
    it("fails to create an object with another illegal id and without one required field", async () => {
        const thing = { id: "~" + rand(10) };
        try {
            await typeDef.validate(thing);
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected 1 error");
            expect(e.errors["value"].length).equals(1, "expected 1 value error");
            expect(e.errors["value"][0]).equals("required", "expected value.required error");
            expect(thing._meta.id).eq(fsSafeName(thing.id)); // id was correctly assigned
        }
    });
    it("fails to create an object without one required field", async () => {
        const thing = { id: rand(10) };
        try {
            await typeDef.validate(thing);
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected 1 error");
            expect(e.errors["value"].length).equals(1, "expected 1 value error");
            expect(e.errors["value"][0]).equals("required", "expected value.required error");
            expect(thing._meta.id).eq(fsSafeName(thing.id)); // id was correctly assigned
        }
    });
    it("fails to create an object with a too-short field", async () => {
        try {
            await typeDef.validate({ id: rand(10), value: rand(10) });
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected 1 error");
            expect(e.errors["value"].length).equals(1, "expected 1 value error");
            expect(e.errors["value"][0]).equals("min", "expected value.min error");
        }
    });
    it("fails to create an object with a too-long field", async () => {
        try {
            await typeDef.validate({ id: rand(10), value: rand(1000) });
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected 1 error");
            expect(e.errors["value"].length).equals(1, "expected 1 value error");
            expect(e.errors["value"][0]).equals("max", "expected value.max error");
        }
    });
    it("fails to create an object with a too-small field", async () => {
        try {
            await typeDef.validate({ id: rand(10), value: rand(20), int: -1000 });
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected 1 error");
            expect(e.errors["int"].length).equals(1, "expected 1 int error");
            expect(e.errors["int"][0]).equals("minValue", "expected int.minValue error");
        }
    });
    it("fails to create an object with a too-large field", async () => {
        try {
            await typeDef.validate({ id: rand(10), value: rand(20), int: 100000 });
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected 1 error");
            expect(e.errors["int"].length).equals(1, "expected 1 int error");
            expect(e.errors["int"][0]).equals("maxValue", "expected int.maxValue error");
        }
    });
    it("fails to create an object with a regex-failing field", async () => {
        try {
            await typeDef.validate({
                id: rand(10),
                value: rand(20),
                alphaOnly: "111",
            });
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected 1 error");
            expect(e.errors["alphaOnly"].length).equals(1, "expected 1 alphaOnly error");
            expect(e.errors["alphaOnly"][0]).equals("regex", "expected alphaOnly.regex error");
        }
    });
    it("fails to create an object where a value is not one of a specific set", async () => {
        try {
            await typeDef.validate({ id: rand(10), value: rand(20), restricted: 42 });
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected 1 error");
            expect(e.errors["restricted"].length).equals(1, "expected 1 restricted error");
            expect(e.errors["restricted"][0]).equals("values", "expected restricted.values error");
        }
    });
    it("fails to create an object where a field is not required but has a minimum length, and the value too short", async () => {
        try {
            await typeDef.validate({
                id: rand(10),
                value: rand(20),
                notRequiredButHasMin: rand(Math.min(2, NOT_REQUIRED_MIN_LEN / 2)),
            });
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(1, "expected 1 error");
            expect(e.errors["notRequiredButHasMin"].length).equals(1, "expected 1 notRequiredButHasMin error");
            expect(e.errors["notRequiredButHasMin"][0]).equals("min", "expected notRequiredButHasMin.min error");
        }
    });
    it("successfully creates an object where a field is not required but has a minimum length, and the value the empty string", async () => {
        const validated = await typeDef.validate({
            id: rand(10),
            value: rand(20),
            notRequiredButHasMin: "",
        });
        expect(validated.notRequiredButHasMin).is.null;
    });
    it("fails to validate an object with multiple validation errors", async () => {
        const badThing = {
            value: rand(10),
            int: 100000,
            alphaOnly: "222",
        };
        try {
            await typeDef.validate(badThing);
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(3, `expected 3 errors (errors=${JSON.stringify(e.errors)})`);
            expect(e.errors["value"].length).equals(1, "expected 1 value error");
            expect(e.errors["value"][0]).equals("min", "expected value.min error");
            expect(e.errors["int"].length).equals(1, "expected 1 value error");
            expect(e.errors["int"][0]).equals("maxValue", "expected value.maxValue error");
            expect(e.errors["alphaOnly"].length).equals(1, "expected 1 alphaOnly error");
            expect(e.errors["alphaOnly"][0]).equals("regex", "expected alphaOnly.regex error");
        }
    });
    it("fails to validate an object with multiple type errors", async () => {
        const badThing = {
            id: 1,
            value: 42,
            int: "foo",
            alphaOnly: false,
            comments: [],
            impliedBoolean: "true",
            restricted: "no",
            multistring: [1, 2, 3],
        };
        try {
            await typeDef.validate(badThing);
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, "incorrect exception type");
            expect(Object.keys(e.errors).length).equals(7, "expected 6 errors");
            expect(e.errors["value"].length).equals(1, "expected 1 value error");
            expect(e.errors["value"][0]).equals("type", "expected value.type error");
            expect(e.errors["int"].length).equals(1, "expected 1 value error");
            expect(e.errors["int"][0]).equals("type", "expected value.type error");
            expect(e.errors["alphaOnly"].length).equals(1, "expected 1 alphaOnly error");
            expect(e.errors["alphaOnly"][0]).equals("type", "expected alphaOnly.type error");
            expect(e.errors["comments"].length).equals(1, "expected 1 comments error");
            expect(e.errors["comments"][0]).equals("type", "expected comments.type error");
            expect(e.errors["impliedBoolean"].length).equals(1, "expected 1 impliedBoolean error");
            expect(e.errors["impliedBoolean"][0]).equals("type", "expected impliedBoolean.type error");
            expect(e.errors["restricted"].length).equals(1, "expected 1 restricted error");
            expect(e.errors["restricted"][0]).equals("type", "expected restricted.type error");
            expect(e.errors["multistring"].length).equals(1, "expected 1 multistring error");
            expect(e.errors["multistring"][0]).equals("type", "expected multistring.type error");
        }
    });
    it("successfully validates and redacts an object, verifying default fields are properly set and redacted fields are null", async () => {
        const comments = rand(1000);
        const validated = typeDef.redact(
            await typeDef.validate({
                id: rand(10),
                value: rand(20),
                int: 100,
                alphaOnly: ALPHA_STRING,
                comments,
                multiselect: ["option-1", "option-3"],
                multistring: ["foo", "bar", "baz"],
            })
        );
        expect(validated.int).eq(100);
        expect(validated.comments).eq(comments);
        expect(validated.alphaOnly).is.null; // password fields are redacted, will be null
        expect(validated.defaultableField).eq(SOME_DEFAULT_VALUE);
        expect(validated.impliedBoolean).eq(false);
        expect(validated.restricted).is.null;
        expect(validated.multiselect.length).eq(2);
        expect(validated.multiselect[0]).eq("option-1");
        expect(validated.multiselect[1]).eq("option-3");
        expect(validated.multistring[0]).eq("foo");
        expect(validated.multistring[1]).eq("bar");
        expect(validated.multistring[2]).eq("baz");
    });
    it("successfully validates an object with an items array", async () => {
        await new MobilettoOrmTypeDef({
            typeName: "localeType",
            fields: {
                locale: {
                    type: "string",
                    items: ["foo", "bar"].map((loc) => {
                        return { value: loc, label: `locale_${loc}` };
                    }),
                    primary: true,
                },
            },
        }).validate({
            locale: "foo",
        });
    });
    it("successfully validates an object with a boolean field that defaults to true, when the field is set to false", async () => {
        const validated = await new MobilettoOrmTypeDef({
            typeName: "defaultBoolean",
            fields: {
                bool: { default: true },
            },
        }).validate({ bool: false });
        expect(validated.bool).eq(false);
    });
});
