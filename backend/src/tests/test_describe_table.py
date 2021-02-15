import os
from tempfile import TemporaryDirectory

from src.create_table import ColumnType
from src.database_connection import create_access_database
from src.describe_table import describe_table

DATABASE_NAME = "name"
A_TABLE_NAME = "table_name"
A_COLUMN_NAME = "column"
ANOTHER_COLUMN_NAME = "another_column"


class TestDescribeTable:
    def test_thenColumnsDescriptionAreReturned(self):
        with TemporaryDirectory() as directory:
            connection = create_access_database(os.path.join(directory, DATABASE_NAME))
            cursor = connection.cursor()
            cursor.execute(
                f"CREATE TABLE {A_TABLE_NAME} ({A_COLUMN_NAME} {ColumnType.SINGLE} NOT NULL, "
                f"{ANOTHER_COLUMN_NAME} {ColumnType.TEXT});"
            )

            description = describe_table(A_TABLE_NAME, connection)

            assert description.columns_description[0].name == A_COLUMN_NAME
            assert description.columns_description[0].type_code == ColumnType.SINGLE
            assert description.columns_description[0].internal_size == 23
            assert description.columns_description[0].nullable is False
            assert description.columns_description[1].name == ANOTHER_COLUMN_NAME
            assert description.columns_description[1].type_code == ColumnType.TEXT
            assert description.columns_description[1].internal_size == 255
            assert description.columns_description[1].nullable is True
