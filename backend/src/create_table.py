from __future__ import annotations

from enum import Enum
from typing import List

from jaydebeapi import Connection
from pydantic import BaseModel


def create_table(statement: CreateDatabaseTableSchema, connection: Connection):
    cursor = connection.cursor()
    cursor.execute(
        f"CREATE TABLE {statement.name} ({','.join([ _field_statement(column) for column in statement.columns])});"
    )


def _field_statement(column_description: DatabaseColumnSchema) -> str:
    return f"{column_description.name} {column_description.type}"


class ColumnType(str, Enum):
    BINARY = "BINARY"
    INTEGER = "INTEGER"
    SINGLE = "FLOAT"
    DECIMAL = "DECIMAL"
    DOUBLE = "DOUBLE"
    UNSIGNED_BYTE = "UNSIGNED_BYTE"
    LONG = "LONG"
    STRING = "VARCHAR"
    TEXT = "CHAR"
    LONG_TEXT = "LONG TEXT"
    BOOLEAN = "BOOLEAN"
    DATETIME = "DATETIME"
    DATE = "DATE"
    TIME = "TIME"


class DatabaseColumnSchema(BaseModel):
    name: str
    type: ColumnType


class CreateDatabaseTableSchema(BaseModel):
    name: str
    columns: List[DatabaseColumnSchema]
