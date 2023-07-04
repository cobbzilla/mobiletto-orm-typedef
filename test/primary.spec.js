import { expect, assert } from "chai";
import * as randomstring from "randomstring";
import { MobilettoOrmError, MobilettoOrmTypeDef } from "../lib/esm/index.js";

const rand = (count) => randomstring.generate(count);

describe("primary field test", async () => {
  it("throws an error if a TypeDef has more than one primary field", async () => {
    try {
      new MobilettoOrmTypeDef({
        typeName: `TestType_${rand(10)}`,
        fields: {
          value: { primary: true },
          int: {
            maxValue: 500,
            primary: true,
          },
        },
      });
      assert.fail(`expected typeDef constructor throw MobilettoOrmError`);
    } catch (e) {
      expect(e).instanceof(MobilettoOrmError);
    }
  });
  it("throws an error if a TypeDef has a primary field with {required: false}", async () => {
    try {
      new MobilettoOrmTypeDef({
        typeName: `TestType_${rand(10)}`,
        fields: {
          value: { primary: true, required: false },
        },
      });
      assert.fail(`expected typeDef constructor throw MobilettoOrmError`);
    } catch (e) {
      expect(e).instanceof(MobilettoOrmError);
    }
  });
  it("throws an error if a TypeDef has a primary field with {updatable: true}", async () => {
    try {
      new MobilettoOrmTypeDef({
        typeName: `TestType_${rand(10)}`,
        fields: {
          value: { primary: true, updatable: true },
        },
      });
      assert.fail(`expected typeDef constructor throw MobilettoOrmError`);
    } catch (e) {
      expect(e).instanceof(MobilettoOrmError);
    }
  });
  it("typeDef.id(obj) returns primary value", async () => {
    const pkey = rand(10);
    const typeDef = new MobilettoOrmTypeDef({
      typeName: `TestType_${rand(10)}`,
      fields: {
        id: {},
        value: { primary: true },
        email: {},
      },
    });
    expect(typeDef.id({ value: pkey })).eq(pkey);
  });
});
