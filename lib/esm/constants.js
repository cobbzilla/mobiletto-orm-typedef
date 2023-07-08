/* eslint-disable @typescript-eslint/no-explicit-any */
import * as randomstring from "randomstring";
export const DEFAULT_MAX_VERSIONS = 5;
export const DEFAULT_MIN_WRITES = 0;
export const DEFAULT_ALTERNATE_ID_FIELDS = ["name", "username", "email"];
export const OBJ_ID_SEP = "_MORM_";
export const VERSION_SUFFIX_RAND_LEN = 16;
export const versionStamp = () => `_${Date.now()}_${randomstring.generate(VERSION_SUFFIX_RAND_LEN)}`;
export const MIN_VERSION_STAMP_LENGTH = versionStamp().length;
export const RESERVED_FIELD_NAMES = ["redaction", "removed"];
export const NUMERIC_CONTROL_TYPES = ["duration", "timestamp", "range"];
export const AUTO_REDACT_CONTROLS = ["password", "hidden", "system"];