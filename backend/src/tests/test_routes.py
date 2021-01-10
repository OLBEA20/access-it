import os
from src.insert_row import TableRow
from src.read_table import TableSchema
from unittest.mock import ANY, Mock, create_autospec

import pytest
from fastapi.testclient import TestClient
from jaydebeapi import Connection
from main import application
from src import root_directory
from src.access_database_already_exist import AccessDatabaseAlreadyExist
from src.access_database_does_not_exist import AccessDatabaseDoesNotExist
from src.create_table import ColumnType, CreateDatabaseTableSchema
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


class TestCreate:
    def test_whenCreatingDatabase_thenDatabaseIsCreateInTheCorrectDirectory(
        self, test_client: TestClient, mocked_create_access_database
    ):
        test_client.post("/databases", json={"name": A_DATABASE_NAME})

        mocked_create_access_database.assert_called_once_with(
            os.path.join(root_directory, f"../databases/{A_DATABASE_NAME}.mdb")
        )

    def test_whenCreatingDatabase_thenDatabaseNameShouldBeReturned(
        self, test_client: TestClient, mocked_create_access_database
    ):
        response = test_client.post("/databases", json={"name": A_DATABASE_NAME})

        assert response.status_code == HTTP_201_CREATED
        assert response.json()["name"] == f"{A_DATABASE_NAME}.mdb"

    def test_givenDatabaseAlreadyExist_thenConflict(
        self, test_client: TestClient, mocked_create_access_database
    ):
        mocked_create_access_database.side_effect = AccessDatabaseAlreadyExist

        response = test_client.post("/databases", json={"name": A_DATABASE_NAME})

        assert response.status_code == HTTP_409_CONFLICT


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

    def test_whenReadingDatabaseTable_thenRowsAndColumnsAreReturned(
        self,
        test_client: TestClient,
        mocked_connect_to_database: Mock,
        mocked_read_table: Mock,
    ):
        mocked_connect_to_database.return_value = create_autospec(Connection)
        mocked_read_table.return_value = TableSchema(
            rows=SOME_ROWS, columns=SOME_COLUMNS
        )

        response = test_client.get(
            f"/databases/{A_DATABASE_NAME}/tables/{A_TABLE_NAME}"
        )

        assert response.status_code == HTTP_200_OK
        assert response.json()["rows"] == SOME_ROWS
        assert response.json()["columns"] == SOME_COLUMNS


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
