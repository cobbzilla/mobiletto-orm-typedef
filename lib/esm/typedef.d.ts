import { MobilettoOrmValidationErrors } from "./errors.js";
import { MobilettoOrmDefaultFieldOpts, MobilettoOrmFieldDefConfig, MobilettoOrmFieldDefConfigs, MobilettoOrmFieldIndexableValue, MobilettoOrmFieldValue } from "./field.js";
import { MobilettoApiConfig, MobilettoOrmIdArg, MobilettoOrmLogger, MobilettoOrmNewInstanceOpts, MobilettoOrmObject, MobilettoOrmObjectMetadata, MobilettoOrmTypeDefConfig } from "./constants.js";
import { FieldValidators, TypeValidations } from "./validation.js";
export type MobilettoOrmIndex = {
    field: string;
    unique: boolean;
};
export declare class MobilettoOrmTypeDef {
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
    readonly filenameFields: string[];
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
    newId(): string;
    versionPrefix(): string;
    newVersion(): string;
    isId(val: string): boolean;
    isVersion(val: string): boolean;
    newMeta(id?: string | null): MobilettoOrmObjectMetadata;
    validate(thing: MobilettoOrmObject, current?: MobilettoOrmObject): Promise<MobilettoOrmObject>;
    typeDefValidations(validated: MobilettoOrmObject, errors: MobilettoOrmValidationErrors): Promise<void>;
    hasRedactions(): boolean;
    redact(thing: MobilettoOrmObject): MobilettoOrmObject;
    idField(thing: MobilettoOrmObject): string | null;
    normalize(thing: MobilettoOrmObject): Promise<MobilettoOrmObject>;
    id(thing: MobilettoOrmObject): any;
    _tabIndexes(fields?: MobilettoOrmFieldDefConfigs): string[];
    tabIndexedFields(fields?: MobilettoOrmFieldDefConfigs): {
        name: string;
        type?: import("./field.js").MobilettoOrmFieldType | undefined;
        inFileName?: boolean | undefined;
        label?: string | undefined;
        control?: import("./field.js").MobilettoOrmFieldControl | undefined;
        default?: MobilettoOrmFieldValue | undefined;
        required?: boolean | undefined;
        when?: ((val: MobilettoOrmObject) => boolean) | undefined;
        primary?: boolean | undefined;
        updatable?: boolean | undefined;
        normalize?: import("./field.js").MobilettoOrmNormalizeFunc | undefined;
        test?: import("./field.js").MobilettoOrmCustomFieldTest | undefined;
        regex?: RegExp | undefined;
        min?: number | undefined;
        max?: number | undefined;
        minValue?: number | undefined;
        maxValue?: number | undefined;
        values?: MobilettoOrmFieldIndexableValue[] | undefined;
        labels?: string[] | undefined;
        items?: import("./field.js").MobilettoOrmFieldItem[] | undefined;
        index?: boolean | undefined;
        indexLevels?: number | undefined;
        unique?: boolean | undefined;
        redact?: boolean | undefined;
        tabIndex?: number | undefined;
        render?: import("./field.js").MobilettoOrmFieldRender | undefined;
        fields?: Record<string, MobilettoOrmFieldDefConfig> | undefined;
        tabIndexes?: string[] | undefined;
    }[];
    typePath(): string;
    generalPath(id: MobilettoOrmIdArg): string;
    renderFilenameFields(obj: MobilettoOrmObject): string | null;
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
