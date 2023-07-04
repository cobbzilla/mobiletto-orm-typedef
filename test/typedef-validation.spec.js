import { expect, assert } from "chai";
import * as randomstring from "randomstring";
import {
  MobilettoOrmValidationError,
  MobilettoOrmTypeDef,
} from "../lib/esm/index.js";

const rand = (count) => randomstring.generate(count);

const typeDefConfig = {
  typeName: `TestType_${rand(10)}`,
  validations: {
    must_sum_to_100: {
      field: "global",
      valid: (v) => (v.slice1 ?? 0) + (v.slice2 ?? 0) === 100,
    },
    slice1_last_digit_3: {
      field: "slice1",
      valid: (v) => (v.slice1 ?? 0) % 10 !== 3,
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
  it("successfully validates with multiple typedef validation errors", async () => {
    const typeDef = new MobilettoOrmTypeDef(typeDefConfig);
    try {
      const validated = await typeDef.validate({
        name: "foo",
        slice1: 13,
        slice2: 11,
      });
      assert.fail(
        `expected validate to throw MobilettoOrmValidationError, but it returned ${validated}`
      );
    } catch (e) {
      expect(e).instanceof(MobilettoOrmValidationError);
      expect(Object.keys(e.errors).length).equals(2, "expected two errors");
      expect(e.errors["slice1"].length).equals(1, "expected 1 slice1 error");
      expect(e.errors["slice1"][0]).equals(
        "invalid",
        "expected slice1.invalid error"
      );
      expect(e.errors["global"].length).equals(1, "expected 1 global error");
      expect(e.errors["global"][0]).equals(
        "must_sum_to_100",
        "expected global.must_sum_to_100 error"
      );
    }
  });
  it("successfully validates even when async validator throws an error", async () => {
    const typeDef = new MobilettoOrmTypeDef(asyncErrorConfig);
    try {
      const validated = await typeDef.validate({
        name: "foo",
        value: 0,
      });
      assert.fail(
        `expected validate to throw MobilettoOrmValidationError, but it returned ${validated}`
      );
    } catch (e) {
      expect(e).instanceof(MobilettoOrmValidationError);
      expect(Object.keys(e.errors).length).equals(1, "expected one error");
      expect(e.errors["value"].length).equals(1, "expected 1 value error");
      expect(e.errors["value"][0]).equals(
        "invalid",
        "expected value.invalid error"
      );
    }
  });
  it("successfully validates when async validator return false", async () => {
    const typeDef = new MobilettoOrmTypeDef(asyncErrorConfig);
    try {
      const validated = await typeDef.validate({
        name: "foo",
        value: 3,
      });
      assert.fail(
        `expected validate to throw MobilettoOrmValidationError, but it returned ${validated}`
      );
    } catch (e) {
      expect(e).instanceof(MobilettoOrmValidationError);
      expect(Object.keys(e.errors).length).equals(1, "expected one error");
      expect(e.errors["value"].length).equals(1, "expected 1 value error");
      expect(e.errors["value"][0]).equals(
        "invalid",
        "expected value.invalid error"
      );
    }
  });
  it("successfully validates when async validator return true", async () => {
    const typeDef = new MobilettoOrmTypeDef(asyncErrorConfig);
    await typeDef.validate({
      name: "foo",
      value: 1,
    });
  });
});
