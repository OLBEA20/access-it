from __future__ import annotations

from typing import List, Optional, Tuple, Union

from jaydebeapi import Connection
from pydantic import BaseModel


def insert_row(table_name: str, row: TableRow, connection: Connection):
    cursor = connection.cursor()
    statement = (
        f"INSERT INTO {table_name} {_columns_name(row)} " f"VALUES {_values(row)};"
    )
    cursor.execute(statement)


def _columns_name(row: TableRow) -> str:
    return f"({', '.join([column_name for column_name,_ in row.values])})".replace(
        "'", ""
    )


def _values(row: TableRow) -> str:
    return (
        f"({', '.join([_to_sql(value) for _, value in row.values])})".replace(
            "'NULL'", "NULL"
        )
        .replace("'TRUE'", "TRUE")
        .replace("'FALSE'", "FALSE")
    )


def _to_sql(value: Optional[Union[int, float, bool, str]]) -> Union[str, float, int]:
    if value is None:
        return "NULL"
    if value is True:
        return "TRUE"
    if value is False:
        return "FALSE"
    if type(value) == str:
        return f"'{value}'"
    return str(value)


class TableRow(BaseModel):
    values: List[Tuple[str, Union[float, int, str, bool, None]]]
