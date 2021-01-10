import os
from tempfile import TemporaryDirectory

from jaydebeapi import Connection

from src.create_table import (
    ColumnType,
    CreateDatabaseTableSchema,
    DatabaseColumnSchema,
    create_table,
)
from src.database_connection import create_access_database
from src.list_tables import list_tables

SOME_TABLE_NAMES = ["table_name", "another_table_name"]
A_COLUMN_NAME = "column_name"


class TestListTables:
    def test_whenListingTables_thenAllTablesAreReturned(self):
        with TemporaryDirectory() as directory:
            connection = create_access_database(os.path.join(directory, "test.mdb"))
            for name in SOME_TABLE_NAMES:
                _create_table(name, connection)

            tables = list_tables(connection)

            assert tables == SOME_TABLE_NAMES

    def test_givenNoTables_whenListingTables_thenNoTablesAreReturned(self):
        with TemporaryDirectory() as directory:
            connection = create_access_database(os.path.join(directory, "test.mdb"))

            tables = list_tables(connection)

            assert tables == []


def _create_table(table_name: str, connection: Connection) -> None:
    create_table(
        CreateDatabaseTableSchema(
            name=table_name,
            columns=[DatabaseColumnSchema(name=A_COLUMN_NAME, type=ColumnType.TEXT)],
        ),
        connection,
    )
