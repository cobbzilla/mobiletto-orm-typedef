import { ValidationErrors } from "./errors.js";
import { MobilettoOrmLogger } from "./util.js";
import { MobilettoOrmDefaultFieldOpts, MobilettoOrmFieldValue, MobilettoOrmFieldDefConfig, MobilettoOrmFieldDefConfigs, MobilettoOrmFieldIndexableValue } from "./field.js";
import { MobilettoOrmTypeDefConfig, MobilettoOrmObject, MobilettoOrmNewInstanceOpts, MobilettoOrmObjectMetadata } from "./constants.js";
import { FieldValidators, TypeValidations } from "./validation.js";
export type MobilettoOrmWithId = {
    id: string;
};
export type MobilettoOrmIdArg = string | MobilettoOrmWithId | any;
export declare class MobilettoOrmTypeDef {
    readonly config: MobilettoOrmTypeDefConfig;
    readonly typeName: string;
    readonly idPrefix: string;
    readonly basePath: string;
    primary?: string;
    readonly alternateIdFields: string[] | null | undefined;
    fields: MobilettoOrmFieldDefConfigs;
    readonly indexes: string[];
    readonly tabIndexes: string[];
    readonly redaction: string[];
    readonly tableFields: string[];
    readonly maxVersions: number;
    readonly minWrites: number;
    readonly specificPathRegex: RegExp;
    readonly validators: FieldValidators;
    readonly validations: TypeValidations;
    readonly logger: MobilettoOrmLogger | null;
    constructor(config: MobilettoOrmTypeDefConfig);
    _log(msg: string, level: string): void;
    log_info(msg: string): void;
    log_warn(msg: string): void;
    log_error(msg: string): void;
    defaultFieldValue(field: MobilettoOrmFieldDefConfig, opts: MobilettoOrmDefaultFieldOpts): MobilettoOrmFieldValue;
    newInstanceFields(fields: MobilettoOrmFieldDefConfigs, rootThing: MobilettoOrmObject, thing: MobilettoOrmObject, opts?: MobilettoOrmNewInstanceOpts): void;
    newBlankInstance(): MobilettoOrmObject;
    newInstance(opts?: MobilettoOrmNewInstanceOpts): MobilettoOrmObject;
    newFullInstance(): MobilettoOrmObject;
    newDummyInstance(): MobilettoOrmObject;
    buildType(typeName?: string, out?: string): string;
    newId(): string;
    newVersion(): string;
    newMeta(id?: string | null): MobilettoOrmObjectMetadata;
    validate(thing: MobilettoOrmObject, current?: MobilettoOrmObject): Promise<MobilettoOrmObject>;
    typeDefValidations(validated: MobilettoOrmObject, errors: ValidationErrors): Promise<void>;
    hasRedactions(): boolean;
    redact(thing: MobilettoOrmObject): MobilettoOrmObject;
    idField(thing: MobilettoOrmObject): string | null;
    id(thing: MobilettoOrmObject): string;
    _tabIndexes(fields?: MobilettoOrmFieldDefConfigs): string[];
    tabIndexedFields(fields?: MobilettoOrmFieldDefConfigs): {
        name: string;
        type?: import("./field.js").MobilettoOrmFieldType | undefined;
        control?: import("./field.js").MobilettoOrmFieldControl | undefined;
        default?: MobilettoOrmFieldValue | undefined;
        required?: boolean | undefined;
        when?: ((val: MobilettoOrmObject) => boolean) | undefined;
        primary?: boolean | undefined;
        updatable?: boolean | undefined;
        normalize?: import("./field.js").MobilettoOrmNormalizeFunc | undefined;
        regex?: RegExp | undefined;
        min?: number | undefined;
        max?: number | undefined;
        minValue?: number | undefined;
        maxValue?: number | undefined;
        values?: MobilettoOrmFieldIndexableValue[] | undefined;
        labels?: string[] | undefined;
        items?: import("./field.js").MobilettoOrmFieldItem[] | undefined;
        index?: boolean | undefined;
        redact?: boolean | undefined;
        tabIndex?: number | undefined;
        render?: import("./field.js").MobilettoOrmFieldRender | undefined;
        fields?: Record<string, MobilettoOrmFieldDefConfig> | undefined;
        tabIndexes?: string[] | undefined;
    }[];
    typePath(): string;
    generalPath(id: MobilettoOrmIdArg): string;
    isSpecificPath(p: string): RegExpMatchArray | null;
    specificBasename(obj: MobilettoOrmObject): string;
    idFromPath(p: string): string;
    specificPath(obj: MobilettoOrmObject): string;
    indexPath(field: string, value: MobilettoOrmFieldIndexableValue): string;
    indexSpecificPath(field: string, obj: MobilettoOrmObject): string;
    tombstone(thing: MobilettoOrmObject): {
        _meta: {
            id: string;
            version: string;
            removed: boolean;
            ctime: number;
            mtime: number;
        };
    };
    isTombstone(thing: MobilettoOrmObject): boolean | undefined;
    extend(otherConfig: MobilettoOrmTypeDefConfig): MobilettoOrmTypeDef;
}