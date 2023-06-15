const path = require('path')
const shasum = require('shasum')
const randomstring = require('randomstring')

function MobilettoOrmError (message, err) {
    this.message = `${message}: ${err ? err : ''}`
    // noinspection JSUnusedGlobalSymbols
    this.err = err
    // Use V8's native method if available, otherwise fallback
    if ('captureStackTrace' in Error) {
        Error.captureStackTrace(this, TypeError)
    } else {
        // noinspection JSUnusedGlobalSymbols
        this.stack = (new Error(this.message)).stack
    }
    MobilettoOrmError.prototype.toString = () => JSON.stringify(this)
}

function MobilettoOrmNotFoundError (id) {
    this.message = `MobilettoOrmNotFoundError: ${id}`
    this.id = id
    // Use V8's native method if available, otherwise fallback
    if ('captureStackTrace' in Error) {
        Error.captureStackTrace(this, TypeError)
    } else {
        // noinspection JSUnusedGlobalSymbols
        this.stack = (new Error(this.message)).stack
    }
    MobilettoOrmNotFoundError.prototype.toString = () => JSON.stringify(this)
}

function MobilettoOrmSyncError (id, message) {
    this.message = message ? message : `MobilettoOrmSyncError: ${id}`
    this.id = id
    // Use V8's native method if available, otherwise fallback
    if ('captureStackTrace' in Error) {
        Error.captureStackTrace(this, TypeError)
    } else {
        // noinspection JSUnusedGlobalSymbols
        this.stack = (new Error(this.message)).stack
    }
    MobilettoOrmSyncError.prototype.toString = () => JSON.stringify(this)
}

function MobilettoOrmValidationError (errors) {
    this.errors = errors
    this.message = JSON.stringify(errors)

    // Use V8's native method if available, otherwise fallback
    if ('captureStackTrace' in Error) {
        Error.captureStackTrace(this, TypeError)
    } else {
        // noinspection JSUnusedGlobalSymbols
        this.stack = (new Error(this.message)).stack
    }
    MobilettoOrmValidationError.prototype.toString = () => JSON.stringify(this)
}

const FIELD_VALIDATIONS = {
    required: (val, req) => !req || (typeof(val) !== 'undefined' && val != null && (typeof(val) !== 'string' || val.length > 0)),
    min: (val, limit) => val == null || typeof(val) === 'string' && val.length >= limit,
    max: (val, limit) => val == null || typeof(val) === 'string' && val.length <= limit,
    minValue: (val, limit) => val == null || (typeof(val) === 'number' && val >= limit),
    maxValue: (val, limit) => val == null || (typeof(val) === 'number' && val <= limit),
    regex: (val, rx) => val == null || !!val.match(rx)
}

const VERSION_SUFFIX_RAND_LEN = 16;
const versionStamp = () => `_${Date.now()}_${randomstring.generate(VERSION_SUFFIX_RAND_LEN)}`
const MIN_VERSION_STAMP_LENGTH = versionStamp().length

function fsSafeName(name) {
    return encodeURIComponent(name).replaceAll('%', '~');
}

const DEFAULT_FIELDS = {
    id: {
        required: true,
        updatable: false,
        normalize: fsSafeName,
        regex: /^[^%~]+$/gi
    }
}

const DEFAULT_MAX_VERSIONS = 5
const DEFAULT_MIN_WRITES = 0

const DEFAULT_ALTERNATE_ID_FIELDS = ['name', 'username', 'email']

const VALID_FIELD_TYPES = ['string', 'number', 'boolean', 'object', 'array']

function determineFieldControl(fieldName, field, fieldType) {
    if (field.control) return field.control
    if (fieldType === 'boolean') return 'flag'
    if (field.multi && Array.isArray(field.multi) && field.multi.length > 0) return 'multi'
    if (field.values && Array.isArray(field.values) && field.values.length > 0) return 'select'
    if (fieldName === 'password') return 'password'
    return 'text'
}

function determineFieldType(fieldName, field) {
    let foundType = field.type ? field.type : null
    if (typeof(field.min) === 'number' ||
        typeof(field.max) === 'number' ||
        (typeof(field.regex) === 'string' || (typeof(field.regex) === 'object' && field.regex instanceof RegExp))) {
        if (foundType != null && foundType !== 'string') {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / string`)
        }
        foundType = 'string'
    }
    if (typeof(field.minValue) === 'number' || typeof(field.maxValue) === 'number') {
        if (foundType != null && foundType !== 'number') {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / number`)
        }
        foundType = 'number'
    }
    const defaultType = typeof(field.default)
    if (defaultType !== 'undefined') {
        if (foundType != null && foundType !== defaultType) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / ${defaultType}`)
        }
        foundType = defaultType
    }
    if (field.values && Array.isArray(field.values) && field.values.length >= 1) {
        const vType = typeof(field.values[0])
        if (foundType != null && foundType !== vType) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / ${vType}`)
        }
        foundType = vType
    }
    if (foundType) {
        if (!VALID_FIELD_TYPES.includes(foundType)) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had invalid type: ${foundType}`)
        }
        return foundType
    }
    return 'string'
}

const OBJ_ID_SEP = '_MORM_'

class MobilettoOrmTypeDef {
    constructor(config) {
        if (typeof(config.typeName) !== 'string' || config.typeName.length <= 0) {
            throw new MobilettoOrmError('invalid TypeDefConfig: no typeName provided')
        }
        if (config.typeName.includes('%') || config.typeName.includes('~')) {
            throw new MobilettoOrmError('invalid TypeDefConfig: typeName cannot contain % or ~ characters')
        }
        this.alternateIdFields = config.alternateIdFields || DEFAULT_ALTERNATE_ID_FIELDS
        this.typeName = fsSafeName(config.typeName)
        this.basePath = config.basePath || ''
        this.fields = Object.assign({}, config.fields, DEFAULT_FIELDS)
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName]
            field.type = determineFieldType(fieldName, field)
            field.control = determineFieldControl(fieldName, field, field.type)
            if (field.values && Array.isArray(field.values)) {
                const hasLabels = field.labels && Array.isArray(field.labels) && field.labels.length === field.values.length
                field.items = []
                if (!hasLabels) field.labels = []
                for (let i = 0; i < field.values.length; i++) {
                    let value = field.values[i];
                    field.items.push({
                        value,
                        label: hasLabels ? field.labels[i] :value
                    })
                    if (!hasLabels) field.labels.push(value)
                }
            } else if (field.items && Array.isArray(field.items)) {
                field.values = field.items.map(i => i.value)
                field.labels = field.items.map(i => i.label)
            }
        })
        this.maxVersions = config.maxVersions || DEFAULT_MAX_VERSIONS
        this.minWrites = config.minWrites || DEFAULT_MIN_WRITES
        this.specificPathRegex  = new RegExp(`^${this.typeName}_.+?${OBJ_ID_SEP}_\\d{13,}_[A-Z\\d]{${VERSION_SUFFIX_RAND_LEN},}\\.json$`, 'gi')
        this.validators = Object.assign({}, FIELD_VALIDATIONS, config.validators || {})
    }
    validate (thing, current) {
        const isCreate = typeof(current) === 'undefined'
        if (typeof(thing.version) !== 'string' || thing.version.length < MIN_VERSION_STAMP_LENGTH) {
            thing.version = versionStamp()
        }
        if (typeof(thing.id) !== 'string' || thing.id.length === 0) {
            if (this.alternateIdFields) {
                for (const alt of this.alternateIdFields) {
                    if (alt in thing) {
                        thing.id = thing[alt]
                        break
                    }
                }
            }
        }
        const now = Date.now()
        if (typeof(thing.ctime) !== 'number' || thing.ctime < 0) {
            thing.ctime = now
        }
        if (typeof(thing.mtime) !== 'number' || thing.mtime < thing.ctime) {
            thing.mtime = now
        }
        const errors = {}
        const validated = {
            id: thing.id,
            version: thing.version,
            ctime: thing.ctime,
            mtime: thing.mtime
        }
        for (const fieldName of Object.keys(this.fields)) {
            const field = this.fields[fieldName]
            const fieldValueType = typeof(thing[fieldName])
            const fieldValue = fieldValueType === 'undefined' ? null : thing[fieldName]
            const updatable = typeof (field.updatable) === 'undefined' || !!field.updatable;
            if (isCreate || updatable) {
                if (field.type && fieldValue != null && field.type !== fieldValueType) {
                    errors[fieldName] = ['type']
                    continue
                }
                if (field.values && fieldValue && !field.values.includes(fieldValue)) {
                    errors[fieldName] = ['values']
                    continue
                }
                for (const validator of Object.keys(this.validators)) {
                    if (typeof(field[validator]) !== 'undefined') {
                        if (!this.validators[validator](fieldValue, field[validator])) {
                            if (validator === 'required' && typeof(field.default) !== 'undefined') {
                                continue
                            }
                            if (typeof(errors[fieldName]) === 'undefined') {
                                errors[fieldName] = []
                            }
                            errors[fieldName].push(validator)
                        }
                    }
                }
                if (typeof(errors[fieldName]) === 'undefined') {
                    let val = null
                    if (isCreate && typeof(field.default) !== 'undefined' && (typeof(fieldValue) !== 'string' || fieldValue && fieldValue.length === 0)) {
                        val = field.default
                    } else {
                        val = fieldValue
                    }
                    if (field.normalize) {
                        validated[fieldName] = field.normalize(val)
                    } else {
                        validated[fieldName] = val
                    }
                }
            }
        }
        if (Object.keys(errors).length > 0) {
            throw new MobilettoOrmValidationError(errors)
        }
        return validated
    }

    id (thing) {
        let foundId = null
        if (typeof(thing.id) === 'string' && thing.id.length > 0) {
            foundId = thing.id
        } else if (this.alternateIdFields) {
            for (const alt of this.alternateIdFields) {
                if (typeof(thing[alt]) === 'string') {
                    foundId = thing[alt]
                    break
                }
            }
        }
        return foundId != null ? fsSafeName(foundId) : null
    }

    typePath () { return (this.basePath.length > 0 ? this.basePath + '/' : '') + this.typeName }

    generalPath (id) {
        const idVal = (typeof(id) === 'object' && id.id && typeof(id.id) === 'string')
            ? id.id
            : typeof(id) === 'string' && id.length > 0 ? id : null
        if (idVal == null) {
            throw new MobilettoOrmError(`typeDef.generalPath: invalid id: ${id}`)
        }
        return this.typePath() + '/' + idVal
    }

    isSpecificPath (p) {
        return path.basename(p).match(this.specificPathRegex)
    }

    specificBasename (obj) {
        return this.typeName + '_' + obj.id + OBJ_ID_SEP + obj.version + '.json'
    }

    idFromPath (p) {
        // start with basename
        let base = path.basename(p)

        // chop type prefix
        if (!base.startsWith(this.typeName + '_')) {
            throw new MobilettoOrmError(`idFromPath: invalid path: ${p}`)
        }
        base = base.substring(this.typeName.length + 1)

        // find OBJ_ID_SEP
        const idSep = base.indexOf(OBJ_ID_SEP)
        if (idSep === -1) {
            throw new MobilettoOrmError(`idFromPath: invalid path: ${p}`)
        }

        // ID is everything until the separator
        return base.substring(0, idSep)
    }

    specificPath (obj) {
        return this.generalPath(obj.id) + '/' + this.specificBasename(obj)
    }

    indexPath (field, value) {
        if (this.fields[field] && !!(this.fields[field].index)) {
            return `${this.typePath()}_idx_${shasum(field)}/${shasum(value)}`
        } else {
            throw new MobilettoOrmError(`typeDef.indexPath: field not indexed: ${field}`)
        }
    }

    indexSpecificPath (field, obj) {
        return `${this.indexPath(field, obj[field])}/${this.specificBasename(obj)}`
    }

    tombstone(thing) {
        return {
            id: thing.id,
            version: versionStamp(),
            removed: true,
            ctime: thing.ctime,
            mtime: Date.now()
        }
    }
}

module.exports = {
    versionStamp,
    MobilettoOrmTypeDef,
    MobilettoOrmError,
    MobilettoOrmNotFoundError,
    MobilettoOrmSyncError,
    MobilettoOrmValidationError
}