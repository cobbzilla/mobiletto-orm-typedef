const { expect, assert} = require('chai')
const randomstring = require('randomstring')

const { MobilettoOrmTypeDef, MobilettoOrmValidationError} = require("../index")

const rand = count => randomstring.generate(count)

const typeDefConfig = {
    typeName: `TestType_${rand(10)}`,
    validations: {
        must_sum_to_100: {
            field: 'global',
            valid: v => (v.slice1 ?? 0) + (v.slice2 ?? 0) === 100
        },
        slice1_last_digit_3: {
            field: 'slice1',
            valid: v => (v.slice1 ?? 0) % 10 !== 3,
            error: 'invalid'
        }
    },
    fields: {
        name: { primary: true },
        slice1: { type: 'number', minValue: 0, maxValue: 100 },
        slice2: { type: 'number', minValue: 0, maxValue: 100 }
    }
}

describe('typedef validation test', async () => {
    it("successfully validates with multiple typedef validation errors", async () => {
        const typeDef = new MobilettoOrmTypeDef(typeDefConfig)
        try {
            const validated = typeDef.validate({
                name: 'foo',
                slice1: 13,
                slice2: 11
            })
            assert.fail(`expected validate to throw MobilettoOrmValidationError, but it returned ${validated}`)
        } catch (e) {
            expect(e).instanceof(MobilettoOrmValidationError)
            expect(Object.keys(e.errors).length).equals(2, 'expected two errors')
            expect(e.errors['slice1'].length).equals(1, 'expected 1 slice1 error')
            expect(e.errors['slice1'][0]).equals('invalid', 'expected slice1.invalid error')
            expect(e.errors['global'].length).equals(1, 'expected 1 global error')
            expect(e.errors['global'][0]).equals('must_sum_to_100', 'expected global.must_sum_to_100 error')
        }
    })
})
