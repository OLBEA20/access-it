import os
from tempfile import TemporaryDirectory

from src.create_table import (
    ColumnType,
    CreateDatabaseTableSchema,
    DatabaseColumnSchema,
    create_table,
)
from src.database_connection import create_access_database

A_COLUMN_NAME = "column_name"
A_TABLE_NAME = "table_name"


class TestCreateTable:
    def test_whenCreatingTable_thenAllColumnsAreCreated(self):
        with TemporaryDirectory() as directory:
            connection = create_access_database(os.path.join(directory, "test.mdb"))

            create_table(
                CreateDatabaseTableSchema(
                    name=A_TABLE_NAME,
                    columns=[
                        DatabaseColumnSchema(name=A_COLUMN_NAME, type=ColumnType.TEXT)
                    ],
                ),
                connection,
            )

            cursor = connection.cursor()
            cursor.execute(f"SELECT * from {A_TABLE_NAME};")
            assert cursor.description[0][0] == A_COLUMN_NAME
