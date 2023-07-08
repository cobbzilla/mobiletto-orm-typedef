/* eslint-disable @typescript-eslint/no-explicit-any */
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
import * as randomstring from "randomstring";
import * as path from "path";
import { addError, MobilettoOrmError, MobilettoOrmValidationError } from "./errors.js";
import { fsSafeName, sha } from "./util.js";
import { DEFAULT_FIELDS, normalized, compareTabIndexes, } from "./field.js";
import { DEFAULT_ALTERNATE_ID_FIELDS, DEFAULT_MAX_VERSIONS, DEFAULT_MIN_WRITES, MIN_VERSION_STAMP_LENGTH, OBJ_ID_SEP, VERSION_SUFFIX_RAND_LEN, versionStamp, } from "./constants.js";
import { FIELD_VALIDATORS, validateFields } from "./validation.js";
import { processFields } from "./fields.js";
export class MobilettoOrmTypeDef {
    constructor(config) {
        if (typeof config.typeName !== "string" || config.typeName.length <= 0) {
            throw new MobilettoOrmError("invalid TypeDefConfig: no typeName provided");
        }
        if (config.typeName.includes("%") || config.typeName.includes("~")) {
            throw new MobilettoOrmError("invalid TypeDefConfig: typeName cannot contain % or ~ characters");
        }
        this.config = config;
        this.alternateIdFields = config.alternateIdFields || DEFAULT_ALTERNATE_ID_FIELDS;
        this.typeName = fsSafeName(config.typeName);
        this.basePath = config.basePath || "";
        this.fields = Object.assign({}, config.fields, DEFAULT_FIELDS);
        this.indexes = [];
        // this.primary = null
        this.redaction = [];
        this.tabIndexes = this._tabIndexes(this.fields);
        processFields(this.fields, "", this);
        // @ts-ignore
        this.tableFields = config.tableFields
            ? config.tableFields
            : this.primary
                ? [this.primary, "ctime", "mtime"]
                : [this.idField(this.newDummyInstance()), "ctime", "mtime"];
        this.maxVersions = config.maxVersions || DEFAULT_MAX_VERSIONS;
        this.minWrites = config.minWrites || DEFAULT_MIN_WRITES;
        this.specificPathRegex = new RegExp(`^${this.typeName}_.+?${OBJ_ID_SEP}_\\d{13,}_[A-Z\\d]{${VERSION_SUFFIX_RAND_LEN},}\\.json$`, "gi");
        this.validators = Object.assign({}, FIELD_VALIDATORS, config.validators || {});
        this.validations =
            config.validations && typeof config.validations === "object" && Object.keys(config.validations).length > 0
                ? config.validations
                : {};
        this.logger = config.logger || null;
    }
    _log(msg, level) {
        if (this.logger && typeof this.logger[level] === "function") {
            this.logger[level](msg);
        }
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
        if (field.type === "array")
            return [];
        if (field.values)
            return field.values[0];
        if (field.type === "string")
            return dummy ? randomstring.generate(Math.ceil(Math.random() * (field.max ? field.max : 10))) : "";
        if (field.type === "number")
            return dummy ? Math.random() * (field.max ? field.max : 100) : 0;
        if (field.type === "boolean")
            return dummy ? Math.floor(1000 * Math.random()) % 2 === 0 : false;
        if (field.type === "object")
            return dummy ? { dummy } : {};
        this.log_warn(`defaultFieldValue: unknown field.type=${field.type ? field.type : "undefined"} for field ${field.name ? field.name : "undefined"}, assuming string and returning ''`);
        return dummy ? randomstring.generate(Math.ceil(Math.random() * (field.max ? field.max : 10))) : "";
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
    newInstance(opts = {}) {
        const newThing = {};
        this.newInstanceFields(this.fields, newThing, newThing, opts);
        return newThing;
    }
    newFullInstance() {
        return this.newInstance({ full: true });
    }
    newDummyInstance() {
        return this.newInstance({ dummy: true });
    }
    validate(thing, current) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = {};
            if (typeof thing.id !== "string" || thing.id.length === 0) {
                if (this.primary) {
                    if (!thing[this.primary] || thing[this.primary].length === 0) {
                        addError(errors, this.primary, "required");
                    }
                    else {
                        thing.id = normalized(this.fields, this.primary, thing);
                    }
                }
                else if (this.alternateIdFields) {
                    for (const alt of this.alternateIdFields) {
                        if (alt in thing) {
                            thing.id = normalized(this.fields, alt, thing);
                            break;
                        }
                    }
                }
            }
            const now = Date.now();
            if (typeof thing.ctime !== "number" || thing.ctime < 0) {
                thing.ctime = now;
            }
            if (typeof thing.mtime !== "number" || thing.mtime < thing.ctime) {
                thing.mtime = now;
            }
            if (typeof thing.version !== "string" || thing.version.length < MIN_VERSION_STAMP_LENGTH) {
                thing.version = versionStamp();
            }
            const validated = {
                id: thing.id,
                version: thing.version,
                ctime: thing.ctime,
                mtime: thing.mtime,
            };
            validateFields(thing, thing, this.fields, current, validated, this.validators, errors, "");
            yield this.typeDefValidations(validated, errors);
            if (Object.keys(errors).length > 0) {
                throw new MobilettoOrmValidationError(errors);
            }
            return validated;
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
    idField(thing) {
        if (typeof thing.id === "string" && thing.id.length > 0) {
            return "id";
        }
        else if (this.primary && thing[this.primary] && thing[this.primary].length > 0) {
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
    id(thing) {
        let foundId = null;
        if (typeof thing.id === "string" && thing.id.length > 0) {
            foundId = normalized(this.fields, "id", thing);
        }
        else if (this.primary && typeof thing[this.primary] === "string" && thing[this.primary].length > 0) {
            foundId =
                thing[this.primary] && thing[this.primary].length > 0
                    ? normalized(this.fields, this.primary, thing)
                    : null;
        }
        else if (this.alternateIdFields) {
            for (const alt of this.alternateIdFields) {
                if (typeof thing[alt] === "string") {
                    foundId = normalized(this.fields, alt, thing);
                    break;
                }
            }
        }
        return foundId != null ? fsSafeName(`${foundId}`) : null;
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
        const idVal = typeof id === "object" && id && id.id && typeof id.id === "string"
            ? id.id
            : typeof id === "string" && id.length > 0
                ? id
                : null;
        if (idVal == null) {
            throw new MobilettoOrmError(`typeDef.generalPath: invalid id: ${id}`);
        }
        return this.typePath() + "/" + idVal;
    }
    isSpecificPath(p) {
        return path.basename(p).match(this.specificPathRegex);
    }
    specificBasename(obj) {
        return this.typeName + "_" + obj.id + OBJ_ID_SEP + obj.version + ".json";
    }
    idFromPath(p) {
        // start with basename
        let base = path.basename(p);
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
        return this.generalPath(obj.id) + "/" + this.specificBasename(obj);
    }
    indexPath(field, value) {
        if (this.indexes.includes(field)) {
            return `${this.typePath()}_idx_${sha(field)}/${sha(value)}`;
        }
        else {
            throw new MobilettoOrmError(`typeDef.indexPath: field not indexed: ${field}`);
        }
    }
    indexSpecificPath(field, obj) {
        return `${this.indexPath(field, obj[field])}/${this.specificBasename(obj)}`;
    }
    tombstone(thing) {
        return {
            id: thing.id,
            version: versionStamp(),
            removed: true,
            ctime: thing.ctime,
            mtime: Date.now(),
        };
    }
    isTombstone(thing) {
        return (thing &&
            typeof thing.id === "string" &&
            typeof thing.version === "string" &&
            thing.version.length > 0 &&
            typeof thing.ctime === "number" &&
            thing.ctime > 0 &&
            typeof thing.mtime === "number" &&
            thing.mtime >= thing.ctime &&
            typeof thing.removed === "boolean" &&
            thing.removed === true);
    }
    extend(otherConfig) {
        const extConfig = Object.assign({}, this.config, otherConfig);
        if (this.config.fields) {
            for (const fieldName of Object.keys(this.config.fields)) {
                // @ts-ignore
                extConfig.fields[fieldName] = Object.assign({}, 
                // @ts-ignore
                this.config.fields[fieldName], 
                // @ts-ignore
                extConfig.fields[fieldName]);
            }
        }
        return new MobilettoOrmTypeDef(extConfig);
    }
}