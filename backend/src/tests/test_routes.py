import os
from tempfile import TemporaryFile
from unittest.mock import ANY, Mock, create_autospec

import pytest
from fastapi.testclient import TestClient
from jaydebeapi import Connection, Cursor
from main import application
from src import root_directory
from src.access_database_already_exist import AccessDatabaseAlreadyExist
from src.access_database_does_not_exist import AccessDatabaseDoesNotExist
from src.create_table import ColumnType, CreateDatabaseTableSchema
from src.insert_row import TableRow
from src.read_table import ColumnDescription, TableSchema
from src.routes import DatabaseStatement
from starlette.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)

A_DATABASE_NAME = "database-name"
A_TABLE_NAME = "table_name"
A_COLUMN_NAME = "column_name"
A_CREATE_TABLE_REQUEST = CreateDatabaseTableSchema(
    **{
        "name": A_TABLE_NAME,
        "columns": [{"name": A_COLUMN_NAME, "type": ColumnType.TEXT}],
    }
)
SOME_ROWS = [["a", "b"], ["c", "d"]]
SOME_COLUMNS = ["column_a", "column_b"]
SOME_COLUMNS_DESCRIPTION = [
    ColumnDescription(
        name="column_a",
        type_code="FLOAT",
        display_size=23,
        internal_size=23,
        precision=0,
        scale=0,
        nullable=False,
    ),
    ColumnDescription(
        name="column_b",
        type_code="VARCHAR",
        display_size=255,
        internal_size=255,
        precision=0,
        scale=0,
        nullable=False,
    ),
]


class TestDownloadDatabaseFile:
    def test_thenDatabaseFileIsReturned(
        self, test_client: TestClient, mocked_read_database_file: Mock
    ):
        a_database_file_content = b"YOLO"
        mocked_read_database_file.return_value = a_database_file_content

        response = test_client.get(f"/databases/{A_DATABASE_NAME}")

        assert response.status_code == HTTP_200_OK
        assert response.content == a_database_file_content

    def test_givenDatabaseFileDoesNotExist_thenNotFound(
        self, test_client: TestClient, mocked_read_database_file: Mock
    ):
        mocked_read_database_file.side_effect = FileNotFoundError

        response = test_client.get(f"/databases/{A_DATABASE_NAME}")

        assert response.status_code == HTTP_404_NOT_FOUND


class TestCreate:
    def test_givenNoFile_whenCreatingDatabase_thenDatabaseIsCreateInTheCorrectDirectory(
        self, test_client: TestClient, mocked_create_access_database
    ):
        test_client.put(f"/databases/{A_DATABASE_NAME}")

        mocked_create_access_database.assert_called_once_with(
            os.path.join(root_directory, f"../databases/{A_DATABASE_NAME}.mdb")
        )

    def test_givenAFile_whenCreatingDatabase_thenFileIsWrittenAsNewDatabase(
        self, test_client: TestClient, mocked_write_database_file: Mock
    ):
        a_database_file = b"yolo"
        with TemporaryFile() as file:
            file.write(a_database_file)
            file.seek(0)

            files = {"database_file": ("database.mdb", file.read())}

            response = test_client.put(
                f"/databases/{A_DATABASE_NAME}",
                files=files,
            )

            assert response.status_code == HTTP_201_CREATED
            mocked_write_database_file.assert_called_once_with(
                A_DATABASE_NAME, a_database_file
            )

    def test_whenCreatingDatabase_thenDatabaseNameShouldBeReturned(
        self, test_client: TestClient, mocked_create_access_database
    ):
        response = test_client.put(f"/databases/{A_DATABASE_NAME}")

        assert response.status_code == HTTP_201_CREATED
        assert response.json()["name"] == f"{A_DATABASE_NAME}"

    def test_givenDatabaseAlreadyExist_thenConflict(
        self, test_client: TestClient, mocked_create_access_database
    ):
        mocked_create_access_database.side_effect = AccessDatabaseAlreadyExist

        response = test_client.put(f"/databases/{A_DATABASE_NAME}")

        assert response.status_code == HTTP_409_CONFLICT


class TestDeleteDatabase:
    def test_thenDatabaseIsRemovedFromFileSystem(
        self, test_client: TestClient, mocked_remove_database_file: Mock
    ):
        response = test_client.delete(f"/databases/{A_DATABASE_NAME}")

        assert response.status_code == HTTP_200_OK
        mocked_remove_database_file.assert_called_once_with(A_DATABASE_NAME)


class TestUpdateRows:
    def test_thenUpdateStatementIsExecuted(
        self, test_client: TestClient, mocked_connect_to_database: Mock
    ):
        mocked_connection = create_autospec(Connection)
        mocked_cursor = create_autospec(Cursor)
        mocked_connection.cursor.return_value = mocked_cursor
        mocked_connect_to_database.return_value = mocked_connection
        a_statement = "UPDATE table set column='value' where 1=1;"

        response = test_client.post(
            f"/databases/{A_DATABASE_NAME}/update",
            json=DatabaseStatement(statement=a_statement).dict(),
        )

        assert response.status_code == HTTP_200_OK
        mocked_cursor.execute.assert_called_once_with(a_statement)

    def test_givenDatabaseDoesNotExist_thenNotFound(
        self, test_client: TestClient, mocked_connect_to_database: Mock
    ):
        mocked_connect_to_database.side_effect = AccessDatabaseDoesNotExist
        a_statement = "UPDATE table set column='value' where 1=1;"

        response = test_client.post(
            f"/databases/{A_DATABASE_NAME}/update",
            json=DatabaseStatement(statement=a_statement).dict(),
        )

        assert response.status_code == HTTP_404_NOT_FOUND


class TestDeleteRows:
    def test_thenDeleteStatementIsExecuted(
        self, test_client: TestClient, mocked_connect_to_database: Mock
    ):
        mocked_connection = create_autospec(Connection)
        mocked_cursor = create_autospec(Cursor)
        mocked_connection.cursor.return_value = mocked_cursor
        mocked_connect_to_database.return_value = mocked_connection
        a_statement = "DELETE FROM table where 1=1;"

        response = test_client.post(
            f"/databases/{A_DATABASE_NAME}/delete",
            json=DatabaseStatement(statement=a_statement).dict(),
        )

        assert response.status_code == HTTP_200_OK
        mocked_cursor.execute.assert_called_once_with(a_statement)

    def test_givenDatabaseDoesNotExist_thenNotFound(
        self, test_client: TestClient, mocked_connect_to_database: Mock
    ):
        mocked_connect_to_database.side_effect = AccessDatabaseDoesNotExist
        a_statement = "DELETE FROM table where 1=1;"

        response = test_client.post(
            f"/databases/{A_DATABASE_NAME}/delete",
            json=DatabaseStatement(statement=a_statement).dict(),
        )

        assert response.status_code == HTTP_404_NOT_FOUND


class TestCreateTable:
    def test_givenDatabaesDoesNotExist_thenNotFound(
        self, test_client: TestClient, mocked_connect_to_database: Mock
    ):
        mocked_connect_to_database.side_effect = AccessDatabaseDoesNotExist

        response = test_client.post(
            f"/databases/{A_DATABASE_NAME}/tables",
            json=A_CREATE_TABLE_REQUEST.dict(),
        )

        assert response.status_code == HTTP_404_NOT_FOUND

    def test_whenCreatingTable_thenTableIsCreated(
        self,
        test_client: TestClient,
        mocked_connect_to_database: Mock,
        mocked_create_table: Mock,
    ):
        mocked_connect_to_database.return_value = create_autospec(Connection)

        response = test_client.post(
            f"/databases/{A_DATABASE_NAME}/tables",
            json=A_CREATE_TABLE_REQUEST.dict(),
        )

        assert response.status_code == HTTP_204_NO_CONTENT
        mocked_create_table.assert_called_once_with(A_CREATE_TABLE_REQUEST, ANY)


class TestListDatabaseTables:
    def test_givenDatabaseDoesNotExist_whenListingTables_thenNotFound(
        self, test_client: TestClient, mocked_connect_to_database: Mock
    ):
        mocked_connect_to_database.side_effect = AccessDatabaseDoesNotExist

        response = test_client.get(f"/databases/{A_DATABASE_NAME}/tables")

        assert response.status_code == HTTP_404_NOT_FOUND

    def test_whenListingTables_thenAllTablesAreReturned(
        self,
        test_client: TestClient,
        mocked_connect_to_database: Mock,
        mocked_list_tables: Mock,
    ):
        some_tables = ["table_name", "another_table_name"]
        mocked_list_tables.return_value = some_tables

        response = test_client.get(f"/databases/{A_DATABASE_NAME}/tables")

        assert response.status_code == HTTP_200_OK
        assert response.json()["tables"] == some_tables


class TestReadDatabaseTable:
    def test_givenDatabaseDoesNotExist_whenReadingTable_thenNotFound(
        self, test_client: TestClient, mocked_connect_to_database: Mock
    ):
        mocked_connect_to_database.side_effect = AccessDatabaseDoesNotExist

        response = test_client.get(
            f"/databases/{A_DATABASE_NAME}/tables/{A_TABLE_NAME}"
        )

        assert response.status_code == HTTP_404_NOT_FOUND

    def test_whenReadingDatabaseTable_thenColumnsDescriptionAreReturned(
        self,
        test_client: TestClient,
        mocked_connect_to_database: Mock,
        mocked_read_table: Mock,
    ):
        mocked_connect_to_database.return_value = create_autospec(Connection)
        mocked_read_table.return_value = TableSchema(
            rows=SOME_ROWS,
            columns_description=SOME_COLUMNS_DESCRIPTION,
        )

        response = test_client.get(
            f"/databases/{A_DATABASE_NAME}/tables/{A_TABLE_NAME}"
        )

        assert response.status_code == HTTP_200_OK
        assert response.json()["columns_description"] == SOME_COLUMNS_DESCRIPTION


class TestInsertDatabaseTableRow:
    def test_givenDatabaseDoesNotExist_whenInsertingTableRow_thenNotFound(
        self, test_client: TestClient, mocked_connect_to_database: Mock
    ):
        mocked_connect_to_database.side_effect = AccessDatabaseDoesNotExist

        response = test_client.post(
            f"/databases/{A_DATABASE_NAME}/tables/{A_TABLE_NAME}/rows",
            json=TableRow(values=[("column_name", "value")]).dict(),
        )

        assert response.status_code == HTTP_404_NOT_FOUND

    def test_whenInsertingTablerow_thenRowIsInserted(
        self,
        test_client: TestClient,
        mocked_connect_to_database: Mock,
        mocked_insert_row: Mock,
    ):
        row = TableRow(values=[("column_name", "value")])
        connection = create_autospec(Connection)
        mocked_connect_to_database.return_value = connection

        response = test_client.post(
            f"/databases/{A_DATABASE_NAME}/tables/{A_TABLE_NAME}/rows", json=row.dict()
        )

        assert response.status_code == HTTP_200_OK
        mocked_insert_row.assert_called_once_with(A_TABLE_NAME, row, connection)
        assert response.json() == {"values": [list(row.values[0])]}


@pytest.fixture
def mocked_create_access_database(mocker):
    return mocker.patch("src.routes.create_access_database")


@pytest.fixture
def test_client():
    return TestClient(application)


@pytest.fixture
def mocked_connect_to_database(mocker):
    return mocker.patch("src.routes.connect_to_database")


@pytest.fixture
def mocked_create_table(mocker):
    return mocker.patch("src.routes.create_table")


@pytest.fixture
def mocked_list_tables(mocker):
    return mocker.patch("src.routes.list_tables")


@pytest.fixture
def mocked_read_table(mocker):
    return mocker.patch("src.routes.read_table")


@pytest.fixture
def mocked_insert_row(mocker):
    return mocker.patch("src.routes.insert_row")


@pytest.fixture
def mocked_write_database_file(mocker) -> Mock:
    return mocker.patch("src.routes.write_database_file")


@pytest.fixture
def mocked_remove_database_file(mocker) -> Mock:
    return mocker.patch("src.routes.remove_database_file")


@pytest.fixture
def mocked_read_database_file(mocker) -> Mock:
    return mocker.patch("src.routes.read_database_file")
