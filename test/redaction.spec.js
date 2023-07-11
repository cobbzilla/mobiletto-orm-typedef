import { describe, it } from "mocha";
import { expect } from "chai";
import { MobilettoOrmTypeDef, randomstring } from "../lib/esm/index.js";

const rand = (count) => randomstring(count);

const typeDefConfig = {
    typeName: `TestType_${rand(10)}`,
    fields: {
        rootField: { primary: true },
        rootRedactField: { redact: true },
        nestedObject: {
            fields: {
                nestedPlainField: {},
                nestedRedactField: { redact: true },
                triplyNestedObject: {
                    fields: {
                        nested3Plain: {},
                        nested3Redact: { redact: true },
                    },
                },
            },
        },
        nestedRedactedObject: {
            redact: true,
            nestedRedactedField1: {},
            nestedRedactedField2: {},
        },
    },
};

describe("redaction test", async () => {
    it("successfully redacts a complex typedef", async () => {
        const thing = {
            rootField: "rootField",
            rootRedactField: "rootRedactField",
            nestedObject: {
                nestedPlainField: "nestedPlainField",
                nestedRedactField: "nestedRedactField",
                triplyNestedObject: {
                    nested3Plain: "nested3Plain",
                    nested3Redact: "nested3Redact",
                },
            },
            nestedRedactedObject: {
                nestedRedactedField1: "nestedRedactedField1",
                nestedRedactedField2: "nestedRedactedField2",
            },
        };
        const typeDef = new MobilettoOrmTypeDef(typeDefConfig);
        const redacted = typeDef.redact(thing);
        expect(redacted).is.not.null;
        expect(redacted.rootField).eq(thing.rootField);
        expect(redacted.rootRedactField).is.null;
        expect(redacted.nestedObject).is.not.null;
        expect(redacted.nestedObject.nestedPlainField).eq(thing.nestedObject.nestedPlainField);
        expect(redacted.nestedObject.nestedRedactField).is.null;
        expect(redacted.nestedObject.triplyNestedObject).is.not.null;
        expect(redacted.nestedObject.triplyNestedObject.nested3Plain).eq(
            thing.nestedObject.triplyNestedObject.nested3Plain
        );
        expect(redacted.nestedObject.triplyNestedObject.nested3Redact).is.null;
        expect(redacted.nestedRedactedObject).is.null;
    });
});
