from __future__ import annotations

from typing import Any, List, Tuple

from jaydebeapi import Connection
from pydantic.main import BaseModel


def read_table(table_name: str, connection: Connection) -> TableSchema:
    cursor = connection.cursor()
    cursor.execute(f"SELECT * from {table_name};")
    results = cursor.fetchall()
    return TableSchema(
        columns=[column_description[0] for column_description in cursor.description],
        rows=results,
    )


class TableSchema(BaseModel):
    columns: List[str]
    rows: List[Tuple[Any, ...]]
