import fetchMock from "fetch-mock";
import { createDatabase, listDatabases } from "../api";

const SOME_DATABASES_NAME = ["a", "b"];
const A_DATABASE_NAME = "a-database";

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
    it("should post to backend the new database name", async () => {
        fetchMock.post("http://localhost:8000/databases", {
            status: 204,
            body: { name: A_DATABASE_NAME },
        });

        const newDatabase = await createDatabase(A_DATABASE_NAME);

        expect(newDatabase).toEqual({ name: A_DATABASE_NAME });
    });
});
