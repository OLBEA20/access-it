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
from src.read_table import read_table

A_TABLE_NAME = "table_name"
A_COLUMN_NAME = "column_name"
ANOTHER_COLUMN_NAME = "another_column_name"
A_VALUE = "a"
ANOTHER_VALUE = "b"


class TestReadTable:
    def test_thenAllColumnNamesArePrsent(self):
        with TemporaryDirectory() as directory:
            connection = create_access_database(os.path.join(directory, "test.mdb"))
            _create_table(A_TABLE_NAME, connection)
            cursor = connection.cursor()
            cursor.execute(
                f"INSERT INTO {A_TABLE_NAME} ({A_COLUMN_NAME}, {ANOTHER_COLUMN_NAME})"
                f" VALUES ('{A_VALUE}', '{ANOTHER_VALUE}')"
            )

            table_values = read_table(A_TABLE_NAME, connection)

            assert table_values.columns == [A_COLUMN_NAME, ANOTHER_COLUMN_NAME]

    def test_thenAllRowsArePrsent(self):
        with TemporaryDirectory() as directory:
            connection = create_access_database(os.path.join(directory, "test.mdb"))
            _create_table(A_TABLE_NAME, connection)
            cursor = connection.cursor()
            cursor.execute(
                f"INSERT INTO {A_TABLE_NAME} ({A_COLUMN_NAME}, {ANOTHER_COLUMN_NAME})"
                f" VALUES ('{A_VALUE}', '{ANOTHER_VALUE}')"
            )
            cursor.execute(
                f"INSERT INTO {A_TABLE_NAME} ({A_COLUMN_NAME}, {ANOTHER_COLUMN_NAME})"
                f" VALUES ('{A_VALUE}', '{ANOTHER_VALUE}')"
            )

            table_values = read_table(A_TABLE_NAME, connection)

            assert len(table_values.rows) == 2
            assert table_values.rows[0] == (A_VALUE, ANOTHER_VALUE)
            assert table_values.rows[1] == (A_VALUE, ANOTHER_VALUE)


def _create_table(table_name: str, connection: Connection) -> None:
    create_table(
        CreateDatabaseTableSchema(
            name=table_name,
            columns=[
                DatabaseColumnSchema(name=A_COLUMN_NAME, type=ColumnType.TEXT),
                DatabaseColumnSchema(name=ANOTHER_COLUMN_NAME, type=ColumnType.TEXT),
            ],
        ),
        connection,
    )
