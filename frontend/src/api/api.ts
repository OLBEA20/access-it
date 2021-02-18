import { config } from "../config/config";
import {
    Database,
    DatabaseTable,
    DatabaseTableCreate,
    ListDabatasesResponse,
    ListDatabaseTablesResponse,
} from "./models";

export function listDatabases(): Promise<ListDabatasesResponse> {
    return fetch(buildApiUrl("databases")).then((response) => response.json());
}

export function createDatabase(
    name: string,
    databaseFile?: File
): Promise<Database> {
    let data;
    if (databaseFile != null) {
        data = new FormData();
        data.append("database_file", databaseFile);
    }
    return fetch(buildApiUrl(`databases/${name}`), {
        method: "Put",
        body: data,
    }).then((response) =>
        succeeded(response) ? response.json() : Promise.reject()
    );
}

export function deleteDatabase(name: string): Promise<ListDabatasesResponse> {
    return fetch(buildApiUrl(`databases/${name}`), {
        method: "Delete",
    }).then((response) =>
        succeeded(response) ? response.json() : Promise.reject()
    );
}

export async function updateDatabase(
    name: string,
    statement: string
): Promise<void> {
    return fetch(buildApiUrl(`databases/${name}/update`), {
        method: "Post",
        body: JSON.stringify({ statement }),
    }).then((response) =>
        succeeded(response) ? response.json() : Promise.reject()
    );
}

export function listDatabaseTables(
    databasenName: string
): Promise<ListDatabaseTablesResponse> {
    return fetch(
        buildApiUrl(`databases/${databasenName}/tables`)
    ).then((response) => response.json());
}

export function createDatabaseTable(
    databaseName: string,
    table: DatabaseTableCreate
): Promise<unknown> {
    return fetch(buildApiUrl(`databases/${databaseName}/tables`), {
        method: "Post",
        body: JSON.stringify(table),
    });
}

export function readDatabaseTable(
    databaseName: string,
    tableName: string
): Promise<DatabaseTable> {
    return fetch(
        buildApiUrl(`databases/${databaseName}/tables/${tableName}`)
    ).then((response) => response.json());
}

export function insertRowInDatabaseTable(
    databaseName: string,
    tableName: string,
    row: string[][]
): Promise<void> {
    return fetch(
        buildApiUrl(`databases/${databaseName}/tables/${tableName}/rows`),
        { method: "Post", body: JSON.stringify({ values: row }) }
    ).then((response) => response.json());
}

function succeeded(response: Response) {
    return response.status >= 200 && response.status <= 300;
}

function buildApiUrl(path: string) {
    return `${config.API_URL}/${path}`;
}
