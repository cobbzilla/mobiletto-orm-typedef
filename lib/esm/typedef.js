/* eslint-disable @typescript-eslint/ban-ts-comment */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { addError, MobilettoOrmError, MobilettoOrmValidationError } from "./errors.js";
import { fsSafeName, generateId, idRegex, MIN_ID_LENGTH, OBJ_ID_SEP, rand, typedefHash, typedefHashDirs, } from "./hash.js";
import { compareTabIndexes, } from "./field.js";
import { basename, isArrayType, DEFAULT_ALTERNATE_ID_FIELDS, DEFAULT_API_CONFIG, DEFAULT_FIELD_INDEX_LEVELS, DEFAULT_ID_INDEX_LEVELS, DEFAULT_MAX_VERSIONS, DEFAULT_MIN_WRITES, VERSION_PREFIX, } from "./constants.js";
import { FIELD_VALIDATORS, validateFields } from "./validation.js";
import { processFields } from "./fields.js";
import { hideTypeDefFields, mergeConfigs } from "./extend.js";
import { MobilettoOrmTypeDefRegistry } from "./registry.js";
import { processApiConfig } from "./api.js";
const ID_PREFIX_REGEX = /^[a-z][a-z~]{0,12}$/gi;
const validShortName = (prefix) => (prefix && prefix.length >= 2 && prefix.match(ID_PREFIX_REGEX) != null) || false;
const defaultShortName = (typeName) => {
    if (typeName.length < 4)
        return typeName.toLowerCase();
    return (typeName.substring(0, 1) + typeName.substring(1).replace(/[aeiou]+/g, "")).substring(0, 4).toLowerCase();
};
const DEFAULT_REGISTRY = new MobilettoOrmTypeDefRegistry({
    name: "default",
    default: true,
});
export class MobilettoOrmTypeDef {
    constructor(config) {
        if (!config.typeName || typeof config.typeName !== "string" || config.typeName.length <= 0) {
            throw new MobilettoOrmError("invalid TypeDefConfig: no typeName provided");
        }
        if (config.typeName.includes("%") || config.typeName.includes("~")) {
            throw new MobilettoOrmError("invalid TypeDefConfig: typeName cannot contain % or ~ characters");
        }
        this.config = config;
        this.scope = config.scope || "any";
        this.registry = config.registry ? config.registry : DEFAULT_REGISTRY;
        this.alternateIdFields = config.alternateIdFields || DEFAULT_ALTERNATE_ID_FIELDS;
        this.typeName = fsSafeName(config.typeName);
        this.singleton = config.singleton || undefined;
        this.shortName = validShortName(config.shortName) ? config.shortName : undefined;
        this.basePath = config.basePath || "";
        if (this.singleton && config.indexLevels && config.indexLevels > 0) {
            throw new MobilettoOrmError("invalid TypeDefConfig: indexLevels cannot be > 0 for singleton type");
        }
        this.indexLevels =
            config.debug || config.singleton ? 0 : config.indexLevels ? config.indexLevels : DEFAULT_ID_INDEX_LEVELS;
        this.fields = config.fields || {};
        this.apiConfig = processApiConfig(config.apiConfig ? Object.assign({}, DEFAULT_API_CONFIG, config.apiConfig) : DEFAULT_API_CONFIG);
        this.indexes = [];
        this.redaction = [];
        this.filenameFields = [];
        this.tabIndexes = this._tabIndexes(this.fields);
        this.refTypes = [];
        processFields(this.fields, "", this);
        this.transientFields = Object.values(this.fields)
            .filter((f) => f.transient)
            .map((f) => f.name);
        this.alternateLookupFields = Object.values(this.fields)
            .filter((f) => f.unique && !f.primary)
            .map((f) => f.name);
        // @ts-ignore
        this.tableFields = config.tableFields
            ? config.tableFields
            : this.primary
                ? [this.primary, "_meta.ctime", "_meta.mtime"]
                : this.alternateIdFields && this.alternateIdFields.length > 0
                    ? [...this.alternateIdFields, "_meta.ctime", "_meta.mtime"]
                    : [this.idField(this.newDummyInstance()), "_meta.ctime", "_meta.mtime"];
        this.search = config.search ? config.search : {};
        this.maxVersions = config.maxVersions || DEFAULT_MAX_VERSIONS;
        this.minWrites = config.minWrites || DEFAULT_MIN_WRITES;
        this.specificPathRegex = new RegExp(`^${this.typeName}_.+?${OBJ_ID_SEP}${VERSION_PREFIX}[a-z][a-z~]{0,12}_[\\da-f]{12}_[\\da-f]{12}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{12}.json$`, "gi");
        this.idRegex = idRegex(this.shortName);
        this.versionRegex = idRegex(this.versionPrefix());
        this.validators = Object.assign({}, FIELD_VALIDATORS, config.validators || {});
        this.validations =
            config.validations && typeof config.validations === "object" && Object.keys(config.validations).length > 0
                ? config.validations
                : {};
        this.logger = config.logger || null;
        this.debug = config.debug || false;
    }
    addRef(fieldPath, refType) {
        const safePath = fieldPath.replace(/\./, "_");
        const jsonPath = fieldPath.replace(".", ".fields.");
        const foundType = this.refTypes.find((r) => r.refType === refType);
        if (!foundType) {
            this.refTypes.push({
                refType,
                RefType: refType.substring(0, 1).toUpperCase() + (refType.length > 1 ? refType.substring(1) : ""),
                fieldPaths: [fieldPath],
                safeFieldPaths: [safePath],
                recursive: refType === this.typeName,
            });
        }
        else {
            foundType.fieldPaths.push(fieldPath);
            foundType.safeFieldPaths.push(safePath);
        }
    }
    textMatch(obj, textSearch) {
        if (this.search.textSearchFields && textSearch) {
            const find = textSearch.toLowerCase();
            for (const f of this.search.textSearchFields) {
                if (`${obj[f] ? JSON.stringify(obj[f]) : ""}`.toLowerCase().includes(find))
                    return true;
            }
        }
        return false;
    }
    _log(msg, level) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        if (this.logger && typeof this.logger[level] === "function") {
            this.logger[level](msg);
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */
    }
    log_info(msg) {
        this._log(msg, "info");
    }
    log_warn(msg) {
        this._log(msg, "warn");
    }
    log_error(msg) {
        this._log(msg, "error");
    }
    defaultFieldValue(field, opts) {
        const dummy = opts && opts.dummy === true;
        if (field.default)
            return field.default;
        if (isArrayType(field.type))
            return [];
        if (field.values)
            return field.values[0];
        if (field.type === "string")
            return dummy ? rand(Math.ceil(Math.random() * (field.max ? field.max : 10))) : "";
        if (field.type === "number")
            return dummy ? Math.random() * (field.max ? field.max : 100) : 0;
        if (field.type === "boolean")
            return dummy ? Math.floor(1000 * Math.random()) % 2 === 0 : false;
        if (field.type === "object")
            return dummy ? { dummy } : {};
        this.log_warn(`defaultFieldValue: unknown field.type=${field.type ? field.type : "undefined"} for field ${field.name ? field.name : "undefined"}, assuming string and returning ''`);
        return dummy ? rand(Math.ceil(Math.random() * (field.max ? field.max : 10))) : "";
    }
    newInstanceFields(fields, rootThing, thing, opts = {}) {
        const dummy = opts && opts.dummy === true;
        for (const fieldName of Object.keys(fields)) {
            const field = fields[fieldName];
            if (field.when && typeof field.when === "function") {
                if (!field.when(rootThing)) {
                    continue;
                }
            }
            if (field.type === "object" &&
                field.fields &&
                Object.keys(field.fields).length > 0 &&
                (field.required || opts.full)) {
                thing[fieldName] = {};
                this.newInstanceFields(field.fields, rootThing, thing[fieldName], opts);
            }
            else if (opts.full || dummy || (typeof field.default !== "undefined" && field.default != null)) {
                thing[fieldName] = this.defaultFieldValue(field, { dummy });
            }
        }
    }
    newBlankInstance() {
        return { _meta: { id: "", version: "", ctime: 0, mtime: 0 } };
    }
    newInstance(opts = {}) {
        const newThing = this.newBlankInstance();
        this.newInstanceFields(this.fields, newThing, newThing, opts);
        return newThing;
    }
    newFullInstance() {
        return this.newInstance({ full: true });
    }
    newDummyInstance() {
        return this.newInstance({ dummy: true });
    }
    newId() {
        return generateId(this.shortName);
    }
    versionPrefix() {
        return VERSION_PREFIX + (this.shortName || defaultShortName(this.typeName));
    }
    newVersion() {
        return generateId(this.versionPrefix());
    }
    isId(val) {
        return this.idRegex.test(val);
    }
    isVersion(val) {
        return this.versionRegex.test(val);
    }
    newMeta(id) {
        const now = Date.now();
        return {
            id: id ? id : this.newId(),
            version: this.newVersion(),
            ctime: now,
            mtime: now,
        };
    }
    validate(thing, current, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = {};
            if (!thing) {
                addError(errors, ".", "required");
                throw new MobilettoOrmValidationError(errors);
            }
            const id = this.id(thing);
            const checkRefs = !opts || !opts.checkRefs || opts.checkRefs === true;
            const now = Date.now();
            if (thing._meta) {
                thing._meta.id = id;
                if (typeof thing._meta.ctime !== "number" || thing._meta.ctime < 0) {
                    thing._meta.ctime = now;
                }
                if (typeof thing._meta.mtime !== "number" || thing._meta.mtime < thing._meta.ctime) {
                    thing._meta.mtime = now;
                }
                if (typeof thing._meta.version !== "string" || thing._meta.version.length < MIN_ID_LENGTH) {
                    thing._meta.version = this.newVersion();
                }
            }
            else {
                thing._meta = this.newMeta(id);
            }
            const validated = {
                _meta: {
                    id: thing._meta.id,
                    version: thing._meta.version,
                    ctime: thing._meta.ctime,
                    mtime: thing._meta.mtime,
                },
            };
            yield validateFields({
                rootThing: thing,
                thing,
                fields: this.fields,
                current,
                validated,
                validators: this.validators,
                errors,
                objPath: "",
                registry: this.registry,
            });
            yield this.typeDefValidations(validated, errors);
            if (Object.keys(errors).length > 0) {
                throw new MobilettoOrmValidationError(errors);
            }
            // re-check id, validation may have changed value
            thing._meta.id = validated._meta.id = this.id(validated);
            return validated;
        });
    }
    validateNoRefCheck(thing, current) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.validate(thing, current, { checkRefs: false });
        });
    }
    typeDefValidations(validated, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationPromises = [];
            Object.keys(this.validations).forEach((vName) => {
                const v = this.validations[vName];
                if (typeof v.valid !== "function" || typeof v.field !== "string") {
                    throw new MobilettoOrmError(`validate: custom validation ${vName} lacked 'valid' function: ${JSON.stringify(v)}`);
                }
                validationPromises.push(
                /* eslint-disable no-async-promise-executor */
                new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    /* eslint-enable no-async-promise-executor */
                    try {
                        const ok = yield v.valid(validated);
                        if (!ok) {
                            const err = typeof v.error === "string" ? v.error : vName;
                            addError(errors, v.field, err);
                        }
                    }
                    catch (e) {
                        this.log_warn(`validate: custom validation ${vName} error: ${JSON.stringify(e)}`);
                        const err = typeof v.error === "string" ? v.error : vName;
                        addError(errors, v.field, err);
                    }
                    finally {
                        resolve();
                    }
                })));
            });
            yield Promise.all(validationPromises);
            return;
        });
    }
    hasRedactions() {
        return this.redaction && this.redaction.length > 0;
    }
    redact(thing) {
        if (this.redaction && this.redaction.length > 0) {
            for (const objPath of this.redaction) {
                let objPointer = thing;
                const pathParts = objPath.split(".");
                for (let i = 0; i < pathParts.length; i++) {
                    const part = pathParts[i];
                    if (i === pathParts.length - 1) {
                        objPointer[part] = null;
                    }
                    else {
                        if (objPointer && objPointer[part]) {
                            objPointer = objPointer[part];
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        return thing;
    }
    idFieldName() {
        return typeof this.primary === "string" && this.primary.length > 0
            ? this.primary
            : this.alternateIdFields && this.alternateIdFields.length > 0
                ? this.alternateIdFields[0]
                : "id";
    }
    idField(thing) {
        if (!thing)
            return null;
        if (this.primary && thing[this.primary] && thing[this.primary].length > 0) {
            return this.primary;
        }
        else if (this.alternateIdFields) {
            for (const alt of this.alternateIdFields) {
                if (typeof thing[alt] === "string" && thing[alt].length > 0) {
                    return alt;
                }
            }
        }
        return null;
    }
    normalize(thing) {
        return __awaiter(this, void 0, void 0, function* () {
            const norm = {};
            const normPromises = [];
            Object.keys(this.fields).forEach((f) => {
                const field = this.fields[f];
                if (typeof thing[f] !== "undefined" && thing[f] != null) {
                    if (typeof field.normalize === "function") {
                        const normFunc = field.normalize;
                        normPromises.push(new Promise((resolve, reject) => {
                            normFunc(thing[f])
                                .then((n) => {
                                norm[f] = n;
                                resolve();
                            })
                                .catch((e) => {
                                reject(e);
                            });
                        }));
                    }
                    else {
                        norm[f] = thing[f];
                    }
                }
            });
            if (normPromises.length > 0)
                yield Promise.all(normPromises);
            return norm;
        });
    }
    id(thing) {
        if (this.singleton) {
            // there can be only one
            return fsSafeName(this.singleton);
        }
        if (this.primary && thing[this.primary]) {
            // primary takes precedence
            return fsSafeName(thing[this.primary]);
        }
        if (thing._meta && typeof thing._meta.id === "string" && thing._meta.id.length > 0) {
            if (this.shortName && !thing._meta.id.startsWith(this.shortName)) {
                this.log_warn(`id: provided _meta.id (${thing._meta.id}) did not start with ${this.shortName}`);
            }
            return fsSafeName(thing._meta.id);
        }
        let foundId = null;
        if (typeof thing.id === "string" && thing.id.length > 0) {
            foundId = thing.id;
            if (this.shortName && !foundId.startsWith(this.shortName)) {
                this.log_warn(`id: provided id did not start with ${this.shortName}, discarding: ${thing.id} (normalized to ${foundId})`);
                foundId = null;
            }
        }
        if (foundId == null &&
            this.primary &&
            typeof thing[this.primary] === "string" &&
            thing[this.primary].length > 0) {
            foundId = thing[this.primary] && thing[this.primary].length > 0 ? thing[this.primary] : null;
            if (foundId && this.shortName && !foundId.startsWith(this.shortName)) {
                this.log_warn(`id: provided primary field ${this.primary} did not start with ${this.shortName}, discarding: ${thing[this.primary]} (normalized to ${foundId})`);
                foundId = null;
            }
        }
        if (foundId == null && this.alternateIdFields) {
            for (const alt of this.alternateIdFields) {
                if (typeof thing[alt] === "string") {
                    foundId = thing[alt];
                    if (this.shortName && !foundId.startsWith(this.shortName)) {
                        this.log_warn(`id: provided alternate ID field ${alt} did not start with ${this.shortName}, discarding: ${thing[alt]} (normalized to ${foundId})`);
                        foundId = null;
                    }
                    else {
                        break;
                    }
                }
            }
        }
        if (this.shortName && foundId) {
            const minIdLength = MIN_ID_LENGTH + this.shortName.length;
            if (!foundId.startsWith(this.shortName) || foundId.length < minIdLength) {
                this.log_warn(`id: resolved foundId ${foundId} did not start with ${this.shortName} or was too short (min length ${minIdLength}), discarding`);
                foundId = null;
            }
        }
        return foundId != null ? fsSafeName(`${foundId}`) : this.newId();
    }
    _tabIndexes(fields = this.fields) {
        return Object.keys(fields).sort((f1, f2) => compareTabIndexes(fields, f1, f2));
    }
    tabIndexedFields(fields = this.fields) {
        return Object.keys(fields)
            .map((f) => {
            return Object.assign({ name: f }, fields[f]);
        })
            .sort((f1, f2) => compareTabIndexes(fields, f1.name, f2.name))
            .filter((f) => f != null);
    }
    typePath() {
        return (this.basePath.length > 0 ? this.basePath + "/" : "") + this.typeName;
    }
    generalPath(id) {
        const idVal = typeof id === "object" ? this.id(id) : typeof id === "string" && id.length > 0 ? fsSafeName(id) : null;
        if (idVal == null) {
            throw new MobilettoOrmError(`typeDef.generalPath: invalid id: ${id}`);
        }
        return this.typePath() + "/" + typedefHashDirs(idVal, this.debug, this.indexLevels);
    }
    renderFilenameFields(obj) {
        if (this.filenameFields && this.filenameFields.length > 0) {
            if (this.filenameFields.length === 1) {
                return obj[this.filenameFields[0]];
            }
            let s = "";
            this.filenameFields.forEach((f) => (s += `_${f}-${obj[f]}`));
            return s.substring(1); // drop leading _
        }
        return null;
    }
    isSpecificPath(p) {
        return basename(p).match(this.specificPathRegex);
    }
    specificBasename(obj) {
        if (!obj._meta || !obj._meta.version) {
            throw new MobilettoOrmError(`specificBasename: no _meta found on object: ${this.id(obj)}`);
        }
        const fieldDesc = this.renderFilenameFields(obj);
        const description = fieldDesc ? fieldDesc : this.id(obj);
        return fsSafeName(this.typeName + "_" + description + OBJ_ID_SEP + obj._meta.version + ".json");
    }
    idFromPath(p) {
        // start with basename
        let base = basename(p);
        // chop type prefix
        if (!base.startsWith(this.typeName + "_")) {
            throw new MobilettoOrmError(`idFromPath: invalid path: ${p}`);
        }
        base = base.substring(this.typeName.length + 1);
        // find OBJ_ID_SEP
        const idSep = base.indexOf(OBJ_ID_SEP);
        if (idSep === -1) {
            throw new MobilettoOrmError(`idFromPath: invalid path: ${p}`);
        }
        // ID is everything until the separator
        return base.substring(0, idSep);
    }
    specificPath(obj) {
        return this.generalPath(this.id(obj)) + "/" + this.specificBasename(obj);
    }
    _indexPath(field, value) {
        if (this.indexes.filter((i) => i.field === field).length > 0) {
            const indexLevels = typeof this.fields[field].indexLevels !== "undefined" && this.fields[field].indexLevels != null
                ? parseInt(`${this.fields[field].indexLevels}`)
                : DEFAULT_FIELD_INDEX_LEVELS;
            return `indexes/${this.typePath()}_idx_${field}_${typedefHash(field, this.debug)}/${typedefHashDirs(value, this.debug, indexLevels)}`;
        }
        else {
            throw new MobilettoOrmError(`typeDef._indexPath(${field}): field not indexed`);
        }
    }
    indexPaths(field, value) {
        if (typeof value === "undefined" || value == null) {
            return [];
        }
        if (Array.isArray(value)) {
            return value.map((v) => this._indexPath(field, v));
        }
        if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
            const coerced = `${value}`;
            this.log_warn(`typeDef.indexPath(${field}): coerced value (type ${typeof value}) to string: ${coerced}`);
            return [this._indexPath(field, coerced)];
        }
        return [this._indexPath(field, value)];
    }
    indexSpecificPaths(field, obj) {
        return this.indexPaths(field, obj[field]).map((p) => `${p}/${this.specificBasename(obj)}`);
        // return `${this.indexPath(field, obj[field])}/${this.specificBasename(obj)}`;
    }
    tombstone(thing) {
        if (!thing._meta || !thing._meta.id || !thing._meta.ctime || !thing._meta.mtime) {
            throw new MobilettoOrmError(`tombstone: missing required _meta fields`);
        }
        const marker = {
            _meta: {
                id: thing._meta.id,
                version: this.newVersion(),
                removed: true,
                ctime: thing._meta.ctime,
                mtime: Date.now(),
            },
        };
        if (this.primary) {
            marker[this.primary] = thing[this.primary];
        }
        return marker;
    }
    isTombstone(thing) {
        return ((thing &&
            thing._meta &&
            typeof thing._meta.id === "string" &&
            typeof thing._meta.version === "string" &&
            thing._meta.version.length > 0 &&
            typeof thing._meta.ctime === "number" &&
            thing._meta.ctime > 0 &&
            typeof thing._meta.mtime === "number" &&
            thing._meta.mtime >= thing._meta.ctime &&
            typeof thing._meta.removed === "boolean" &&
            thing._meta.removed === true) ||
            false);
    }
    extend(otherConfig) {
        return new MobilettoOrmTypeDef(mergeConfigs(this.config, otherConfig));
    }
    hideFields(toHide) {
        return hideTypeDefFields(this, toHide);
    }
}
//# sourceMappingURL=typedef.js.map