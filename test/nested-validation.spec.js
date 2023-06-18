const { expect, assert } = require('chai')
const randomstring = require("randomstring")
const { MobilettoOrmValidationError, MobilettoOrmTypeDef } = require('../index')

const rand = count => randomstring.generate(count)

const nestedType1 = new MobilettoOrmTypeDef({
    typeName: `TestType_${rand(10)}`,
    fields: {
        primaryField: { primary: true },
        otherField: {},
        nestedObject: {
            fields: {
                // these fields can be omitted if the entire object is omitted
                // because there is no 'required: true' at the nestedObject-level
                nested1: { required: true },
                nested2: { regex: /[A-Z]+/i },
                triplyNestedObject: {
                    fields: {
                        nested3Plain: { values: [1, 2, 3] },
                        nested3Required: { required: true },
                    }
                }
            }
        }
    }
})

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
                    }
                }
            }
        }
    }
})

describe('nested validation test with optional nested object with required fields', async () => {
    it("successfully validates an empty object against a typedef with an optional nested object with required fields", async () => {
        try {
            const validated = nestedType1.validate({})
            assert.fail(`expected nestedType1.validate to throw MobilettoOrmValidationError, but it returned ${validated}`)
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, 'incorrect exception type')
            expect(Object.keys(e.errors).length).equals(2, 'expected two errors')
            expect(e.errors['id'].length).equals(1, 'expected 1 id error')
            expect(e.errors['id'][0]).equals('required', 'expected id.required error')
            expect(e.errors['primaryField'].length).equals(1, 'expected 1 primary error')
            expect(e.errors['primaryField'][0]).equals('required', 'expected primary.required error')
        }
    })
})

describe('nested validation test with required nested object with required fields', async () => {
    it("successfully validates an empty object against this complex typedef with a required nested object with required fields", async () => {
        try {
            const validated = nestedType2.validate({})
            assert.fail(`expected nestedType2.validate to throw MobilettoOrmValidationError, but it returned ${validated}`)
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, 'incorrect exception type')
            expect(Object.keys(e.errors).length).equals(3, 'expected three errors')
            expect(e.errors['id'].length).equals(1, 'expected 1 id error')
            expect(e.errors['id'][0]).equals('required', 'expected id.required error')
            expect(e.errors['primaryField'].length).equals(1, 'expected 1 primary error')
            expect(e.errors['primaryField'][0]).equals('required', 'expected primary.required error')
            expect(e.errors['nestedObject'].length).equals(1, 'expected 1 nestedObject error')
            expect(e.errors['nestedObject'][0]).equals('required', 'expected nestedObject.required error')
        }
    })
    it("successfully validates an object with an empty nested value against this complex typedef", async () => {
        try {
            const validated = nestedType2.validate({ nestedObject: {} })
            assert.fail(`expected nestedType2.validate to throw MobilettoOrmValidationError, but it returned ${validated}`)
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, 'incorrect exception type')
            expect(Object.keys(e.errors).length).equals(4, 'expected four errors')
            expect(e.errors['id'].length).equals(1, 'expected 1 id error')
            expect(e.errors['id'][0]).equals('required', 'expected id.required error')
            expect(e.errors['primaryField'].length).equals(1, 'expected 1 primary error')
            expect(e.errors['primaryField'][0]).equals('required', 'expected primary.required error')
            expect(e.errors['nestedObject.nested1'].length).equals(1, 'expected 1 nestedObject.nested1 error')
            expect(e.errors['nestedObject.nested1'][0]).equals('required', 'expected nestedObject.nested1.required error')
            expect(e.errors['nestedObject.triplyNestedObject'].length).equals(1, 'expected 1 nestedObject.triplyNestedObject error')
            expect(e.errors['nestedObject.triplyNestedObject'][0]).equals('required', 'expected nestedObject.triplyNestedObject.required error')
        }
    })
    it("successfully validates an object with many invalid values against this complex typedef", async () => {
        try {
            const validated = nestedType2.validate({
                nestedObject: {
                    nested2: 'r3g3xFail',
                    triplyNestedObject: {
                        nested3Plain: 42
                    }
                }
            })
            assert.fail(`expected nestedType2.validate to throw MobilettoOrmValidationError, but it returned ${validated}`)
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError, 'incorrect exception type')
            expect(Object.keys(e.errors).length).equals(6, 'expected six errors')
            expect(e.errors['id'].length).equals(1, 'expected 1 id error')
            expect(e.errors['id'][0]).equals('required', 'expected id.required error')
            expect(e.errors['primaryField'].length).equals(1, 'expected 1 primary error')
            expect(e.errors['primaryField'][0]).equals('required', 'expected primary.required error')
            expect(e.errors['nestedObject.nested1'].length).equals(1, 'expected 1 nestedObject.nested1 error')
            expect(e.errors['nestedObject.nested1'][0]).equals('required', 'expected nestedObject.nested1.required error')
            expect(e.errors['nestedObject.nested2'].length).equals(1, 'expected 1 nestedObject.nested2 error')
            expect(e.errors['nestedObject.nested2'][0]).equals('regex', 'expected nestedObject.nested2.regex error')
            expect(e.errors['nestedObject.triplyNestedObject.nested3Plain'].length).equals(1, 'expected 1 nestedObject.triplyNestedObject.nested3Plain error')
            expect(e.errors['nestedObject.triplyNestedObject.nested3Plain'][0]).equals('values', 'expected nestedObject.triplyNestedObject.nested3Plain.values error')
            expect(e.errors['nestedObject.triplyNestedObject.nested3Required'].length).equals(1, 'expected 1 nestedObject.triplyNestedObject.nested3Required error')
            expect(e.errors['nestedObject.triplyNestedObject.nested3Required'][0]).equals('required', 'expected nestedObject.triplyNestedObject.nested3Required.values error')
        }
    })
})
