import fetchMock from "fetch-mock";
import {
    Database,
    DatabaseTable,
    DatabaseTableCreate,
    ListDabatasesResponse,
    ListDatabaseTablesResponse,
} from "./models";

export function listDatabases(): Promise<ListDabatasesResponse> {
    return fetch("http://localhost:8000/databases").then((response) =>
        response.json()
    );
}

export function createDatabase(name: string): Promise<Database> {
    return fetch("http://localhost:8000/databases", {
        method: "Post",
        body: JSON.stringify({ name }),
    }).then((response) =>
        succeeded(response) ? response.json() : Promise.reject()
    );
}

export function listDatabaseTables(
    databasenName: string
): Promise<ListDatabaseTablesResponse> {
    return fetch(
        `http://localhost:8000/databases/${databasenName}/tables`
    ).then((response) => response.json());
}

export function createDatabaseTable(
    databaseName: string,
    table: DatabaseTableCreate
): Promise<unknown> {
    return fetch(`http://localhost:8000/databases/${databaseName}/tables`, {
        method: "Post",
        body: JSON.stringify(table),
    });
}

export function readDatabaseTable(
    databaseName: string,
    tableName: string
): Promise<DatabaseTable> {
    return fetch(
        `http://localhost:8000/databases/${databaseName}/tables/${tableName}`
    ).then((response) => response.json());
}

function succeeded(response: Response) {
    return response.status >= 200 && response.status <= 300;
}
