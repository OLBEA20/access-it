import os
from tempfile import TemporaryDirectory

from jaydebeapi import Connection, Cursor
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
ANOTHER_VALUE = 1


class TestReadTable:
    def test_thenAllColumnsDescriptionArePresent(self):
        with TemporaryDirectory() as directory:
            connection = create_access_database(os.path.join(directory, "test.mdb"))
            _create_table(A_TABLE_NAME, connection)
            cursor: Cursor = connection.cursor()
            cursor.execute(
                f"INSERT INTO {A_TABLE_NAME} ({A_COLUMN_NAME}, {ANOTHER_COLUMN_NAME})"
                f" VALUES ('{A_VALUE}', '{ANOTHER_VALUE}')"
            )

            table_values = read_table(A_TABLE_NAME, connection)

            assert table_values.columns_description[0].name == A_COLUMN_NAME
            assert table_values.columns_description[0].type_code == ColumnType.TEXT
            assert table_values.columns_description[0].internal_size == 255
            assert table_values.columns_description[0].nullable is True
            assert table_values.columns_description[1].name == ANOTHER_COLUMN_NAME
            assert table_values.columns_description[1].type_code == ColumnType.SINGLE
            assert table_values.columns_description[1].internal_size == 23
            assert table_values.columns_description[1].nullable is True

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
                DatabaseColumnSchema(name=ANOTHER_COLUMN_NAME, type=ColumnType.SINGLE),
            ],
        ),
        connection,
    )
