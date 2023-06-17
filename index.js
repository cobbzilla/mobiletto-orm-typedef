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
    if (fieldType === 'array') return 'multi'
    if ((field.values && Array.isArray(field.values) && field.values.length > 0) ||
        (field.items && Array.isArray(field.items) && field.items.length > 0)) return 'select'
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
    const hasItems = (field.items && Array.isArray(field.items))
    const hasValues = (field.values && Array.isArray(field.values))
    const hasLabels = (field.labels && Array.isArray(field.labels))
    let defaultType = typeof(field.default)
    if (defaultType !== 'undefined') {
        if (Array.isArray(field.default) && !hasValues && !hasItems && (!field.type || (field.type !== 'select' && field.type !== 'multi'))) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had an array as default value, but is not a select or multi field`)
        }
        if ((field.type && field.type === 'array') || (field.control && field.control === 'multi')) {
            if (!Array.isArray(field.default)) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had type 'array' or control 'multi' but default value type is ${defaultType} (expected array)`)
            }
            defaultType = 'array'
        }
        if (foundType != null && foundType !== defaultType) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / ${defaultType}`)
        }
        foundType = defaultType
    }
    if (hasValues || hasItems) {
        if (hasValues && hasItems && field.values.length !== field.items.length) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for values (${field.values.length}) vs items (${field.items.length})`)
        }
        if (hasLabels) {
            if (hasValues && field.values.length !== field.labels.length) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for values (${field.values.length}) vs labels (${field.labels.length})`)
            }
            if (hasItems && field.items.length !== field.labels.length) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for items (${field.values.length}) vs labels (${field.labels.length})`)
            }
        }
        if ((!field.control || field.control !== 'multi') && (!field.type || field.type !== 'array')) {
            const vType = hasItems && field.items.length > 0 && typeof (field.items[0].value) !== 'undefined' && field.items[0].value != null
                ? typeof (field.items[0].value)
                : hasValues && field.values.length > 0
                    ? typeof (field.values[0])
                    : null
            if (vType) {
                if (foundType != null && foundType !== vType) {
                    throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / ${vType}`)
                }
                foundType = vType
            }
        }
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

const AUTO_REDACT_CONTROLS = ['password', 'hidden', 'system']

function compareTabIndexes(fields, f1, f2) {
    return typeof (fields[f1].tabIndex) === 'number' && typeof (fields[f2].tabIndex) === 'number'
        ? fields[f1].tabIndex - fields[f2].tabIndex
        : typeof (fields[f1].tabIndex) === 'number'
            ? -1
            : typeof (fields[f2].tabIndex) === 'number'
                ? 1 : 0
}

class MobilettoOrmTypeDef {
    constructor(config) {
        if (typeof(config.typeName) !== 'string' || config.typeName.length <= 0) {
            throw new MobilettoOrmError('invalid TypeDefConfig: no typeName provided')
        }
        if (config.typeName.includes('%') || config.typeName.includes('~')) {
            throw new MobilettoOrmError('invalid TypeDefConfig: typeName cannot contain % or ~ characters')
        }
        this.config = config
        this.alternateIdFields = config.alternateIdFields || DEFAULT_ALTERNATE_ID_FIELDS
        this.typeName = fsSafeName(config.typeName)
        this.basePath = config.basePath || ''
        this.fields = Object.assign({}, config.fields, DEFAULT_FIELDS)
        this.redaction = []
        this.indexes = []
        this.normalization = []
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName]
            field.type = determineFieldType(fieldName, field)
            field.control = determineFieldControl(fieldName, field, field.type)
            if (!!(field.index)) {
                this.indexes.push(fieldName)
            }
            if (!!(field.normalize)) {
                this.normalization.push(fieldName)
            }
            if (typeof(field.redact) === 'undefined' && AUTO_REDACT_CONTROLS.includes(field.control)) {
                if (fieldName !== 'id') {
                    field.redact = true
                    this.redaction.push(fieldName)
                }
            } else if (typeof(field.redact) === 'boolean' && field.redact === true) {
                if (fieldName === 'id') {
                    throw new MobilettoOrmError('cannot redact id field')
                }
                this.redaction.push(fieldName)
            }
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
            const thingValueType = typeof(thing[fieldName])
            const currentValueType = isCreate ? 'undefined' : typeof(current[fieldName])
            const updatable = typeof (field.updatable) === 'undefined' || !!field.updatable;
            const useThingValue = isCreate || (updatable && thingValueType !== 'undefined' && thing[fieldName] != null)
            const fieldValue = useThingValue
                ? thing[fieldName]
                : currentValueType !== 'undefined'
                    ? current[fieldName]
                    : null
            if (useThingValue) {
                if (field.type && fieldValue != null && field.type !== thingValueType && !(field.type === 'array' && Array.isArray(fieldValue))) {
                    errors[fieldName] = ['type']
                    continue
                }
                if (field.values && fieldValue && (
                    (field.type === 'array' && Array.isArray(fieldValue) && !fieldValue.every(v => field.values.includes(v))) ||
                    (field.type !== 'array' && !field.values.includes(fieldValue))) ) {
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
                    if (isCreate && typeof(field.default) !== 'undefined' &&
                        (!fieldValue || (typeof(fieldValue.length) === 'number' && fieldValue.length === 0))) {
                        val = field.default
                    } else {
                        val = typeof(fieldValue) === 'undefined' ? null : fieldValue
                    }
                    // only normalize we used the caller-provided value
                    // do not re-normalize if we used the current value
                    if (useThingValue && fieldValue && field.normalize) {
                        validated[fieldName] = field.normalize(val)
                    } else {
                        validated[fieldName] = val
                    }
                }
            } else if (!isCreate && currentValueType !== 'undefined') {
                validated[fieldName] = current[fieldName]
            }
        }
        if (Object.keys(errors).length > 0) {
            throw new MobilettoOrmValidationError(errors)
        }
        return validated
    }

    hasRedactions () { return this.redaction.length > 0 }

    redact (thing) {
        if (this.redaction.length > 0) {
            for (const fieldName of this.redaction) {
                const field = this.fields[fieldName]
                if (field.redact && typeof (field.redact) === 'boolean' && field.redact === true && thing[fieldName]) {
                    thing[fieldName] = null
                }
            }
        }
        return thing
    }

    id (thing) {
        let foundId = null
        if (typeof(thing.id) === 'string' && thing.id.length > 0) {
            foundId = thing.id
        } else if (this.alternateIdFields) {
            for (const alt of this.alternateIdFields) {
                if (typeof(thing[alt]) === 'string') {
                    foundId = this.fields && this.fields[alt] && typeof(this.fields[alt].normalize) === 'function'
                        ? this.fields[alt].normalize(thing[alt])
                        : thing[alt]
                    break
                }
            }
        }
        return foundId != null ? fsSafeName(foundId) : null
    }

    tabIndexes () {
        const fields = this.fields
        return Object.keys(fields)
            .sort((f1, f2) => compareTabIndexes(fields, f1, f2))
    }

    tabIndexedFields () {
        const fields = this.fields
        return Object.keys(fields)
            .map((f) => {
                return {
                    name: f,
                    ...fields[f]
                }
            })
            .sort((f1, f2) => compareTabIndexes(fields, f1.name, f2.name))
            .filter(f => f != null)
    }

    typePath () { return (this.basePath.length > 0 ? this.basePath + '/' : '') + this.typeName }

    generalPath (id) {
        const idVal = (typeof(id) === 'object' && id && id.id && typeof(id.id) === 'string')
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
        if (this.indexes.includes(field)) {
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

    extend (otherConfig) {
        const extConfig = Object.assign({}, this.config, otherConfig)
        if (this.config.fields) {
            for (const fieldName of Object.keys(this.config.fields)) {
                extConfig.fields[fieldName] = Object.assign({}, this.config.fields[fieldName], extConfig.fields[fieldName])
            }
        }
        return new MobilettoOrmTypeDef(extConfig)
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
