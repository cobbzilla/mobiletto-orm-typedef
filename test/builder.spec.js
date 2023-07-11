import { describe, it } from "mocha";
import { expect, assert } from "chai";
import * as randomstring from "randomstring";
import { MobilettoOrmTypeDef } from "../lib/esm/index.js";

const rand = (count) => randomstring.generate(count);

describe("type builder test", async () => {
    it("builds a simple type", async () => {
        const typeDef = new MobilettoOrmTypeDef({
            typeName: `TestType_${rand(10)}`,
            fields: {
                value: { type: "number" },
                int: {
                    maxValue: 500,
                    primary: true,
                },
                flag: { default: true },
            },
        });
        const builtType = typeDef.buildType();
        expect(builtType).eq(
            `export type ${typeDef.typeName}Type = {\n` +
                "    value?: number;\n" +
                "    int: number;\n" +
                "    flag?: boolean;\n" +
                "    id: string;\n" +
                "    ctime?: number;\n" +
                "    mtime?: number;\n" +
                "};\n"
        );
    });
    it("builds a complex type", async () => {
        const typeDef = new MobilettoOrmTypeDef({
            typeName: "ComplexBuilder",
            fields: {
                primary: { primary: true },
                nested: {
                    fields: {
                        value: { type: "string" },
                        nested: {
                            required: true,
                            fields: {
                                inner: { default: 0 },
                            },
                        },
                    },
                },
            },
        });
        const builtTypes = typeDef.buildType();
        expect(builtTypes).eq(
            "export type ComplexBuilder_nested_nestedType = {\n" +
                "    inner?: number;\n" +
                "};\n" +
                "\n" +
                "export type ComplexBuilder_nestedType = {\n" +
                "    value?: string;\n" +
                "    nested: ComplexBuilder_nested_nestedType;\n" +
                "};\n" +
                "\n" +
                "export type ComplexBuilderType = {\n" +
                "    primary: string;\n" +
                "    nested?: ComplexBuilder_nestedType;\n" +
                "    id: string;\n" +
                "    ctime?: number;\n" +
                "    mtime?: number;\n" +
                "};\n"
        );
    });
});
