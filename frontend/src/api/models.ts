export interface ListDabatasesResponse {
    names: string[];
}

export interface ListDatabaseTablesResponse {
    tables: string[];
}

export interface Database {
    name: string;
}

export interface DatabaseTableCreate {
    name: string;
    columns: TableColumn[];
}

export interface DatabaseTable {
    columns: string[];
    rows: (string | number | boolean | null)[][];
}

export interface TableColumn {
    name: string;
    type: ColumnType;
}

export enum ColumnType {
    SINGLE = "SINGLE",
    DOUBLE = "DOUBLE",
    UNSIGNED_BYTE = "UNSIGNED_BYTE",
    SHORT = "SHORT",
    LONG = "LONG",
    TEXT = "TEXT",
    LONG_TEXT = "LONG TEXT",
    BOOLEAN = "BOOLEAN",
    DATETIME = "DATETIME",
}
