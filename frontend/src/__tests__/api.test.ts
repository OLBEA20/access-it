import fetchMock from "fetch-mock";
import {
    createDatabase,
    createDatabaseTable,
    listDatabases,
    listDatabaseTables,
    readDatabaseTable,
} from "../api/api";
import { ColumnType } from "../api/models";

const SOME_DATABASES_NAME = ["a", "b"];
const SOME_DATABASE_TABLES = ["table_1", "table_2"];
const A_DATABASE_NAME = "a-database";
const A_TABLE_CREATE = {
    name: SOME_DATABASE_TABLES[0],
    columns: [{ name: "column", type: ColumnType.TEXT }],
};
const A_TABLE = {
    columns: ["column"],
    rows: [["a", "b"], ["c"], ["d"]],
};

describe("api", () => {
    beforeEach(() => {
        fetchMock.reset();
    });

    describe("on list databases", () => {
        it("should return databases", async () => {
            fetchMock.get("http://localhost:8000/databases", {
                status: 200,
                body: { names: SOME_DATABASES_NAME },
            });

            const databases = await listDatabases();

            expect(databases.names).toEqual(SOME_DATABASES_NAME);
        });
    });

    describe("on create database", () => {
        beforeEach(() => {
            fetchMock.reset();
        });

        it("should put to backend the new database name", async () => {
            fetchMock.put(
                `http://localhost:8000/databases/${A_DATABASE_NAME}`,
                {
                    status: 204,
                    body: { name: A_DATABASE_NAME },
                }
            );

            const newDatabase = await createDatabase(A_DATABASE_NAME);

            expect(newDatabase).toEqual({ name: A_DATABASE_NAME });
        });

        describe("on error conflict", () => {
            it("should raise", () => {
                fetchMock.put(
                    `http://localhost:8000/databases/${A_DATABASE_NAME}`,
                    {
                        status: 409,
                    }
                );

                expect.assertions(1);
                expect(createDatabase(A_DATABASE_NAME)).rejects.toBeUndefined();
            });
        });
    });

    describe("on list database tables", () => {
        it("should return tables", async () => {
            fetchMock.get(
                `http://localhost:8000/databases/${SOME_DATABASES_NAME[0]}/tables`,
                {
                    status: 200,
                    body: { tables: SOME_DATABASE_TABLES },
                }
            );

            const { tables } = await listDatabaseTables(SOME_DATABASES_NAME[0]);

            expect(tables).toEqual(SOME_DATABASE_TABLES);
        });
    });

    describe("on create database table", () => {
        it("should post to backend table schema", () => {
            fetchMock.post(
                `http://localhost:8000/databases/${SOME_DATABASES_NAME[0]}/tables`,
                { status: 204 }
            );

            createDatabaseTable(SOME_DATABASES_NAME[0], A_TABLE_CREATE);

            expect(
                fetchMock.called(
                    `http://localhost:8000/databases/${SOME_DATABASES_NAME[0]}/tables`,
                    { method: "Post", body: A_TABLE_CREATE }
                )
            ).toBeTruthy();
        });
    });

    describe("on read database table", () => {
        it("should return table", async () => {
            fetchMock.get(
                `http://localhost:8000/databases/${SOME_DATABASES_NAME[0]}/tables/${SOME_DATABASE_TABLES[0]}`,
                {
                    status: 200,
                    body: A_TABLE,
                }
            );

            const table = await readDatabaseTable(
                SOME_DATABASES_NAME[0],
                SOME_DATABASE_TABLES[0]
            );

            expect(table).toEqual(A_TABLE);
        });
    });
});
