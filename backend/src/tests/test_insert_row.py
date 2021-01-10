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
from src.insert_row import TableRow, insert_row

A_TABLE_NAME = "table_name"
A_TEXT_COLUMN_NAME = "a_text_column_name"
A_BOOLEAN_COLUMN_NAME = "a_boolean_column_name"
A_NULL_COLUMN_NAME = "a_null_column_name"
AN_INTEGER_COLUMN_NAME = "an_integer_column_name"
A_FLOAT_COLUMN_NAME = "a_float_column_name"

A_TEXT_VALUE = "allo"
A_BOOLEAN_VALUE = True
A_NULL_VALUE = None
AN_INTEGER_VALUE = 12
A_FLOAT_VALUE = 1.1234


class TestInsertRow:
    def test_thenRowIsInserted(self):
        with TemporaryDirectory() as directory:
            connection = create_access_database(os.path.join(directory, "test.mdb"))
            _create_table(A_TABLE_NAME, connection)
            cursor = connection.cursor()

            insert_row(
                A_TABLE_NAME,
                TableRow(
                    values=[
                        (A_TEXT_COLUMN_NAME, A_TEXT_VALUE),
                        (A_BOOLEAN_COLUMN_NAME, A_BOOLEAN_VALUE),
                        (A_NULL_COLUMN_NAME, A_NULL_VALUE),
                        (AN_INTEGER_COLUMN_NAME, AN_INTEGER_VALUE),
                        (A_FLOAT_COLUMN_NAME, A_FLOAT_VALUE),
                    ]
                ),
                connection,
            )

            cursor.execute(f"SELECT * FROM {A_TABLE_NAME};")
            results = cursor.fetchone()
            assert results[0] == A_TEXT_VALUE
            assert results[1] == A_BOOLEAN_VALUE
            assert results[2] == A_NULL_VALUE
            assert results[3] == AN_INTEGER_VALUE
            assert results[4] == A_FLOAT_VALUE


def _create_table(table_name: str, connection: Connection) -> None:
    create_table(
        CreateDatabaseTableSchema(
            name=table_name,
            columns=[
                DatabaseColumnSchema(name=A_TEXT_COLUMN_NAME, type=ColumnType.TEXT),
                DatabaseColumnSchema(
                    name=A_BOOLEAN_COLUMN_NAME, type=ColumnType.BOOLEAN
                ),
                DatabaseColumnSchema(name=A_NULL_COLUMN_NAME, type=ColumnType.TEXT),
                DatabaseColumnSchema(name=AN_INTEGER_COLUMN_NAME, type=ColumnType.LONG),
                DatabaseColumnSchema(name=A_FLOAT_COLUMN_NAME, type=ColumnType.DOUBLE),
            ],
        ),
        connection,
    )
