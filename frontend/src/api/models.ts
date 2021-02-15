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
    SHORT = "SHORT",
    BINARY = "BINARY",
    INTEGER = "INTEGER",
    SINGLE = "FLOAT",
    DECIMAL = "DECIMAL",
    DOUBLE = "DOUBLE",
    UNSIGNED_BYTE = "UNSIGNED_BYTE",
    LONG = "LONG",
    STRING = "VARCHAR",
    TEXT = "CHAR",
    LONG_TEXT = "LONG TEXT",
    BOOLEAN = "BOOLEAN",
    DATETIME = "DATETIME",
    DATE = "DATE",
    TIME = "TIME",
}

export interface TableDescription {
    columns_description: ColumnDescription[];
}

export interface ColumnDescription {
    name: string;
    type_code: string;
    display_size: number;
    internal_size: number;
    precision: number;
    scale: number;
    nullable: boolean;
}
