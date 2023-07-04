declare module 'mobiletto-orm-typedef' {
    export function versionStamp(): string;

    export function normalized(fields: any, fieldName: string, thing: any): any;

    export class MobilettoOrmTypeDef {
        constructor(config: any);

        config: any;
        alternateIdFields: any;
        typeName: any;
        basePath: any;
        fields: any;
        indexes: any[];
        primary: any;
        redaction: any[];
        tabIndexes: string[];
        tableFields: any;
        maxVersions: any;
        minWrites: any;
        specificPathRegex: RegExp;
        validators: any;
        validations: any;
        logger: any;

        _log(msg: any, level: any): void;

        log_info(msg: any): void;

        log_warn(msg: any): void;

        log_error(msg: any): void;

        defaultFieldValue(field: any, opts: any): any;

        newInstanceFields(fields: any, rootThing: any, thing: any, opts?: {}): void;

        newInstance(opts?: {}): {};

        newFullInstance(): {};

        newDummyInstance(): {};

        validate(thing: any, current: any): Promise<{
            id: any;
            version: any;
            ctime: any;
            mtime: any;
        }>;

        typeDefValidations(validated: any, errors: any): Promise<any[]>;

        hasRedactions(): boolean;

        redact(thing: any): any;

        idField(thing: any): any;

        id(thing: any): any;

        _tabIndexes(fields?: any): string[];

        tabIndexedFields(fields?: any): any[];

        typePath(): string;

        generalPath(id: any): string;

        isSpecificPath(p: any): any;

        specificBasename(obj: any): string;

        idFromPath(p: any): any;

        specificPath(obj: any): string;

        indexPath(field: any, value: any): string;

        indexSpecificPath(field: any, obj: any): string;

        tombstone(thing: any): {
            id: any;
            version: string;
            removed: boolean;
            ctime: any;
            mtime: number;
        };

        isTombstone(thing: any): boolean;

        extend(otherConfig: any): MobilettoOrmTypeDef;
    }

    export function MobilettoOrmError(message: any, err: any): void;

    export class MobilettoOrmError {
        constructor(message: any, err: any);

        message: string;
        err: any;
        stack: string;
    }

    export function MobilettoOrmNotFoundError(id: any): void;

    export class MobilettoOrmNotFoundError {
        constructor(id: any);

        message: string;
        id: any;
        stack: string;
    }

    export function MobilettoOrmSyncError(id: any, message: any): void;

    export class MobilettoOrmSyncError {
        constructor(id: any, message: any);

        message: any;
        id: any;
        stack: string;
    }

    export function MobilettoOrmValidationError(errors: any): void;

    export class MobilettoOrmValidationError {
        constructor(errors: any);

        errors: any;
        message: string;
        stack: string;
    }
}
