/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as path from "path";
import { addError, MobilettoOrmError, MobilettoOrmValidationError, MobilettoOrmValidationErrors } from "./errors.js";
import {
    fsSafeName,
    generateId,
    idRegex,
    MIN_ID_LENGTH,
    OBJ_ID_SEP,
    rand,
    typedefHash,
    typedefHashDirs,
} from "./hash.js";
import {
    compareTabIndexes,
    MobilettoOrmDefaultFieldOpts,
    MobilettoOrmFieldDefConfig,
    MobilettoOrmFieldDefConfigs,
    MobilettoOrmFieldIndexableValue,
    MobilettoOrmFieldValue,
} from "./field.js";
import {
    DEFAULT_ALTERNATE_ID_FIELDS,
    DEFAULT_API_CONFIG,
    DEFAULT_FIELD_INDEX_LEVELS,
    DEFAULT_ID_INDEX_LEVELS,
    DEFAULT_MAX_VERSIONS,
    DEFAULT_MIN_WRITES,
    MobilettoApiConfig,
    MobilettoOrmIdArg,
    MobilettoOrmLogger,
    MobilettoOrmNewInstanceOpts,
    MobilettoOrmObject,
    MobilettoOrmObjectMetadata,
    MobilettoOrmTypeDefConfig,
    VERSION_PREFIX,
} from "./constants.js";
import { FIELD_VALIDATORS, FieldValidators, TypeValidations, validateFields } from "./validation.js";
import { processFields } from "./fields.js";
import { mergeConfigs } from "./extend.js";

const ID_PREFIX_REGEX = /^[a-z][a-z~]{0,12}$/g;

const validIdPrefix = (prefix?: string): boolean =>
    (prefix && prefix.length >= 2 && prefix.match(ID_PREFIX_REGEX) != null) || false;

const defaultIdPrefix = (typeName: string): string => {
    if (typeName.length < 4) return typeName.toLowerCase();
    return (typeName.substring(0, 1) + typeName.substring(1).replace(/[aeiou]+/g, "")).substring(0, 4).toLowerCase();
};

export type MobilettoOrmIndex = {
    field: string;
    unique: boolean;
};

export class MobilettoOrmTypeDef {
    readonly config: MobilettoOrmTypeDefConfig;
    readonly typeName: string;
    readonly singleton?: string;
    readonly idPrefix?: string;
    readonly basePath: string;
    readonly indexLevels: number;
    primary?: string;
    readonly alternateIdFields: string[] | null;
    readonly alternateLookupFields: string[];
    fields: MobilettoOrmFieldDefConfigs;
    readonly apiConfig: MobilettoApiConfig;
    readonly indexes: MobilettoOrmIndex[];
    readonly tabIndexes: string[];
    readonly redaction: string[];
    readonly tableFields: string[];
    readonly maxVersions: number;
    readonly minWrites: number;
    readonly specificPathRegex: RegExp;
    readonly idRegex: RegExp;
    readonly versionRegex: RegExp;
    readonly validators: FieldValidators;
    readonly validations: TypeValidations;
    readonly logger: MobilettoOrmLogger | null;
    readonly debug: boolean;
    constructor(config: MobilettoOrmTypeDefConfig) {
        if (typeof config.typeName !== "string" || config.typeName.length <= 0) {
            throw new MobilettoOrmError("invalid TypeDefConfig: no typeName provided");
        }
        if (config.typeName.includes("%") || config.typeName.includes("~")) {
            throw new MobilettoOrmError("invalid TypeDefConfig: typeName cannot contain % or ~ characters");
        }
        this.config = config;
        this.alternateIdFields = config.alternateIdFields || DEFAULT_ALTERNATE_ID_FIELDS;
        this.typeName = fsSafeName(config.typeName);
        this.singleton = config.singleton || undefined;
        this.idPrefix = validIdPrefix(config.idPrefix) ? (config.idPrefix as string) : undefined;
        this.basePath = config.basePath || "";
        this.indexLevels = config.debug ? 0 : config.indexLevels ? config.indexLevels : DEFAULT_ID_INDEX_LEVELS;
        this.fields = config.fields || {};
        this.apiConfig = config.apiConfig || DEFAULT_API_CONFIG;
        this.indexes = [];
        this.redaction = [];
        this.tabIndexes = this._tabIndexes(this.fields);
        processFields(this.fields, "", this);
        this.alternateLookupFields = Object.values(this.fields)
            .filter((f) => f.unique)
            .map((f) => f.name) as string[];
        // @ts-ignore
        this.tableFields = config.tableFields
            ? config.tableFields
            : this.primary
            ? [this.primary, "_meta.ctime", "_meta.mtime"]
            : [this.idField(this.newDummyInstance()), "_meta.ctime", "_meta.mtime"];
        this.maxVersions = config.maxVersions || DEFAULT_MAX_VERSIONS;
        this.minWrites = config.minWrites || DEFAULT_MIN_WRITES;
        this.specificPathRegex = new RegExp(
            `^${this.typeName}_.+?${OBJ_ID_SEP}${VERSION_PREFIX}[a-z]{2,12}_[\\da-f]{12}_[\\da-f]{12}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{12}.json$`,
            "gi"
        );
        this.idRegex = idRegex(this.idPrefix);
        this.versionRegex = idRegex(this.versionPrefix());
        this.validators = Object.assign({}, FIELD_VALIDATORS, config.validators || {});
        this.validations =
            config.validations && typeof config.validations === "object" && Object.keys(config.validations).length > 0
                ? config.validations
                : {};
        this.logger = config.logger || null;
        this.debug = config.debug || false;
    }

    _log(msg: string, level: string) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        if (this.logger && typeof (this.logger as any)[level] === "function") {
            (this.logger as any)[level](msg);
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */
    }
    log_info(msg: string) {
        this._log(msg, "info");
    }
    log_warn(msg: string) {
        this._log(msg, "warn");
    }
    log_error(msg: string) {
        this._log(msg, "error");
    }

    defaultFieldValue(field: MobilettoOrmFieldDefConfig, opts: MobilettoOrmDefaultFieldOpts): MobilettoOrmFieldValue {
        const dummy = opts && opts.dummy === true;
        if (field.default) return field.default;
        if (field.type === "array") return [];
        if (field.values) return field.values[0];
        if (field.type === "string") return dummy ? rand(Math.ceil(Math.random() * (field.max ? field.max : 10))) : "";
        if (field.type === "number") return dummy ? Math.random() * (field.max ? field.max : 100) : 0;
        if (field.type === "boolean") return dummy ? Math.floor(1000 * Math.random()) % 2 === 0 : false;
        if (field.type === "object") return dummy ? { dummy } : {};
        this.log_warn(
            `defaultFieldValue: unknown field.type=${field.type ? field.type : "undefined"} for field ${
                field.name ? field.name : "undefined"
            }, assuming string and returning ''`
        );
        return dummy ? rand(Math.ceil(Math.random() * (field.max ? field.max : 10))) : "";
    }

    newInstanceFields(
        fields: MobilettoOrmFieldDefConfigs,
        rootThing: MobilettoOrmObject,
        thing: MobilettoOrmObject,
        opts: MobilettoOrmNewInstanceOpts = {}
    ) {
        const dummy = opts && opts.dummy === true;
        for (const fieldName of Object.keys(fields)) {
            const field = fields[fieldName];
            if (field.when && typeof field.when === "function") {
                if (!field.when(rootThing)) {
                    continue;
                }
            }
            if (
                field.type === "object" &&
                field.fields &&
                Object.keys(field.fields).length > 0 &&
                (field.required || opts.full)
            ) {
                thing[fieldName] = {};
                this.newInstanceFields(field.fields, rootThing, thing[fieldName], opts);
            } else if (opts.full || dummy || (typeof field.default !== "undefined" && field.default != null)) {
                thing[fieldName] = this.defaultFieldValue(field, { dummy });
            }
        }
    }

    newBlankInstance(): MobilettoOrmObject {
        return { _meta: { id: "", version: "", ctime: 0, mtime: 0 } };
    }
    newInstance(opts: MobilettoOrmNewInstanceOpts = {}): MobilettoOrmObject {
        const newThing: MobilettoOrmObject = this.newBlankInstance();
        this.newInstanceFields(this.fields, newThing, newThing, opts);
        return newThing;
    }
    newFullInstance() {
        return this.newInstance({ full: true });
    }
    newDummyInstance() {
        return this.newInstance({ dummy: true });
    }

    newId(): string {
        return generateId(this.idPrefix);
    }
    versionPrefix(): string {
        return VERSION_PREFIX + (this.idPrefix || defaultIdPrefix(this.typeName));
    }
    newVersion(): string {
        return generateId(this.versionPrefix());
    }
    isId(val: string): boolean {
        return this.idRegex.test(val);
    }
    isVersion(val: string): boolean {
        return this.versionRegex.test(val);
    }
    newMeta(id?: string | null): MobilettoOrmObjectMetadata {
        const now = Date.now();
        return {
            id: id ? id : this.newId(),
            version: this.newVersion(),
            ctime: now,
            mtime: now,
        };
    }

    async validate(thing: MobilettoOrmObject, current?: MobilettoOrmObject): Promise<MobilettoOrmObject> {
        const errors = {};
        if (!thing) {
            addError(errors, ".", "required");
            throw new MobilettoOrmValidationError(errors);
        }
        const id = this.id(thing);
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
        } else {
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
        await validateFields(thing, thing, this.fields, current, validated, this.validators, errors, "");
        await this.typeDefValidations(validated, errors);
        if (Object.keys(errors).length > 0) {
            throw new MobilettoOrmValidationError(errors);
        }
        // re-check id, validation may have changed value
        thing._meta.id = validated._meta.id = this.id(validated);
        return validated;
    }

    async typeDefValidations(validated: MobilettoOrmObject, errors: MobilettoOrmValidationErrors) {
        const validationPromises: Promise<void>[] = [];
        Object.keys(this.validations).forEach((vName) => {
            const v = this.validations[vName];
            if (typeof v.valid !== "function" || typeof v.field !== "string") {
                throw new MobilettoOrmError(
                    `validate: custom validation ${vName} lacked 'valid' function: ${JSON.stringify(v)}`
                );
            }
            validationPromises.push(
                /* eslint-disable no-async-promise-executor */
                new Promise(async (resolve) => {
                    /* eslint-enable no-async-promise-executor */
                    try {
                        const ok = await v.valid(validated);
                        if (!ok) {
                            const err = typeof v.error === "string" ? v.error : vName;
                            addError(errors, v.field, err);
                        }
                    } catch (e) {
                        this.log_warn(`validate: custom validation ${vName} error: ${JSON.stringify(e)}`);
                        const err = typeof v.error === "string" ? v.error : vName;
                        addError(errors, v.field, err);
                    } finally {
                        resolve();
                    }
                })
            );
        });
        await Promise.all(validationPromises);
        return;
    }

    hasRedactions() {
        return this.redaction && this.redaction.length > 0;
    }

    redact(thing: MobilettoOrmObject) {
        if (this.redaction && this.redaction.length > 0) {
            for (const objPath of this.redaction) {
                let objPointer = thing;
                const pathParts = objPath.split(".");
                for (let i = 0; i < pathParts.length; i++) {
                    const part = pathParts[i];
                    if (i === pathParts.length - 1) {
                        objPointer[part] = null;
                    } else {
                        if (objPointer && objPointer[part]) {
                            objPointer = objPointer[part];
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        return thing;
    }

    idField(thing: MobilettoOrmObject) {
        if (!thing) return null;
        if (typeof thing.id === "string" && thing.id.length > 0) {
            return "id";
        } else if (this.primary && thing[this.primary] && thing[this.primary].length > 0) {
            return this.primary;
        } else if (this.alternateIdFields) {
            for (const alt of this.alternateIdFields) {
                if (typeof thing[alt] === "string" && thing[alt].length > 0) {
                    return alt;
                }
            }
        }
        return null;
    }

    async normalize(thing: MobilettoOrmObject): Promise<MobilettoOrmObject> {
        const norm: MobilettoOrmObject = {};
        const normPromises: Promise<void>[] = [];
        Object.keys(this.fields).forEach((f) => {
            const field = this.fields[f];
            if (typeof thing[f] !== "undefined" && thing[f] != null) {
                if (typeof field.normalize === "function") {
                    const normFunc = field.normalize;
                    normPromises.push(
                        new Promise<void>((resolve, reject) => {
                            normFunc(thing[f])
                                .then((n) => {
                                    norm[f] = n;
                                    resolve();
                                })
                                .catch((e) => {
                                    reject(e);
                                });
                        })
                    );
                } else {
                    norm[f] = thing[f];
                }
            }
        });
        if (normPromises.length > 0) await Promise.all(normPromises);
        return norm;
    }

    id(thing: MobilettoOrmObject) {
        if (this.singleton) {
            // there can be only one
            return this.singleton;
        }
        let foundId = null;
        if (thing._meta && typeof thing._meta.id === "string") {
            foundId = thing._meta.id;
            if (this.idPrefix && !foundId.startsWith(this.idPrefix)) {
                this.log_warn(
                    `id: provided _meta.id did not start with idPrefix ${this.idPrefix}, discarding: ${thing._meta.id} (normalized to ${foundId})`
                );
                foundId = null;
            }
        }
        if (foundId == null && typeof thing.id === "string" && thing.id.length > 0) {
            foundId = thing.id;
            if (this.idPrefix && !foundId.startsWith(this.idPrefix)) {
                this.log_warn(
                    `id: provided id did not start with idPrefix ${this.idPrefix}, discarding: ${thing.id} (normalized to ${foundId})`
                );
                foundId = null;
            }
        }
        if (
            foundId == null &&
            this.primary &&
            typeof thing[this.primary] === "string" &&
            thing[this.primary].length > 0
        ) {
            foundId = thing[this.primary] && thing[this.primary].length > 0 ? thing[this.primary] : null;
            if (foundId && this.idPrefix && !foundId.startsWith(this.idPrefix)) {
                this.log_warn(
                    `id: provided primary field ${this.primary} did not start with idPrefix ${
                        this.idPrefix
                    }, discarding: ${thing[this.primary]} (normalized to ${foundId})`
                );
                foundId = null;
            }
        }
        if (foundId == null && this.alternateIdFields) {
            for (const alt of this.alternateIdFields) {
                if (typeof thing[alt] === "string") {
                    foundId = thing[alt];
                    if (this.idPrefix && !foundId.startsWith(this.idPrefix)) {
                        this.log_warn(
                            `id: provided alternate ID field ${alt} did not start with idPrefix ${this.idPrefix}, discarding: ${thing[alt]} (normalized to ${foundId})`
                        );
                        foundId = null;
                    } else {
                        break;
                    }
                }
            }
        }
        if (this.idPrefix && foundId) {
            const minIdLength = MIN_ID_LENGTH + this.idPrefix.length;
            if (!foundId.startsWith(this.idPrefix) || foundId.length < minIdLength) {
                this.log_warn(
                    `id: resolved foundId ${foundId} did not start with idPrefix ${this.idPrefix} or was too short (min length ${minIdLength}), discarding`
                );
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
                return {
                    name: f,
                    ...fields[f],
                };
            })
            .sort((f1, f2) => compareTabIndexes(fields, f1.name, f2.name))
            .filter((f) => f != null);
    }

    typePath() {
        return (this.basePath.length > 0 ? this.basePath + "/" : "") + this.typeName;
    }

    generalPath(id: MobilettoOrmIdArg) {
        const idVal = typeof id === "object" ? this.id(id) : typeof id === "string" && id.length > 0 ? id : null;
        if (idVal == null) {
            throw new MobilettoOrmError(`typeDef.generalPath: invalid id: ${id}`);
        }
        return this.typePath() + "/" + typedefHashDirs(idVal, this.debug, this.indexLevels);
    }

    isSpecificPath(p: string) {
        return path.basename(p).match(this.specificPathRegex);
    }

    specificBasename(obj: MobilettoOrmObject) {
        if (!obj._meta || !obj._meta.version) {
            throw new MobilettoOrmError(`specificBasename: no _meta found on object: ${this.id(obj)}`);
        }
        return this.typeName + "_" + this.id(obj) + OBJ_ID_SEP + obj._meta.version + ".json";
    }

    idFromPath(p: string) {
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

    specificPath(obj: MobilettoOrmObject) {
        return this.generalPath(this.id(obj)) + "/" + this.specificBasename(obj);
    }

    indexPath(field: string, value: MobilettoOrmFieldIndexableValue) {
        if (typeof value === "undefined" || value == null) {
            throw new MobilettoOrmError(`typeDef.indexPath(${field}): undefined value`);
        }
        if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
            const coerced = `${value}`;
            this.log_warn(`typeDef.indexPath(${field}): coerced value (type ${typeof value}) to string: ${coerced}`);
            value = coerced;
        }
        if (this.indexes.filter((i) => i.field === field).length > 0) {
            const indexLevels =
                typeof this.fields[field].indexLevels !== "undefined" && this.fields[field].indexLevels != null
                    ? parseInt(`${this.fields[field].indexLevels}`)
                    : DEFAULT_FIELD_INDEX_LEVELS;
            return `${this.typePath()}_idx_${typedefHash(field, this.debug)}/${typedefHashDirs(
                value,
                this.debug,
                indexLevels
            )}`;
        } else {
            throw new MobilettoOrmError(`typeDef.indexPath(${field}): field not indexed`);
        }
    }

    indexSpecificPath(field: string, obj: MobilettoOrmObject) {
        return `${this.indexPath(field, obj[field])}/${this.specificBasename(obj)}`;
    }

    tombstone(thing: MobilettoOrmObject) {
        if (!thing._meta || !thing._meta.id || !thing._meta.ctime || !thing._meta.mtime) {
            throw new MobilettoOrmError(`tombstone: missing required _meta fields`);
        }
        return {
            _meta: {
                id: thing._meta.id,
                version: this.newVersion(),
                removed: true,
                ctime: thing._meta.ctime,
                mtime: Date.now(),
            },
        };
    }

    isTombstone(thing: MobilettoOrmObject) {
        return (
            thing &&
            thing._meta &&
            typeof thing._meta.id === "string" &&
            typeof thing._meta.version === "string" &&
            thing._meta.version.length > 0 &&
            typeof thing._meta.ctime === "number" &&
            thing._meta.ctime > 0 &&
            typeof thing._meta.mtime === "number" &&
            thing._meta.mtime >= thing._meta.ctime &&
            typeof thing._meta.removed === "boolean" &&
            thing._meta.removed === true
        );
    }

    extend(otherConfig: MobilettoOrmTypeDefConfig) {
        return new MobilettoOrmTypeDef(mergeConfigs(this.config, otherConfig));
    }
}
