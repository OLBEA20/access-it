from __future__ import annotations

from typing import Any, List, Tuple

from jaydebeapi import Connection
from pydantic.main import BaseModel


def read_table(table_name: str, connection: Connection) -> TableSchema:
    cursor = connection.cursor()
    cursor.execute(f"SELECT * from {table_name};")
    results = cursor.fetchall()

    return TableSchema(
        columns_description=[
            ColumnDescription(
                name=description[0],
                type_code=description[1].values[0],
                display_size=description[2],
                internal_size=description[3],
                precision=description[4],
                scale=description[5],
                nullable=description[6],
            )
            for description in cursor.description
        ],
        rows=results,
    )


class ColumnDescription(BaseModel):
    name: str
    type_code: str
    display_size: int
    internal_size: int
    precision: int
    scale: int
    nullable: bool


class TableSchema(BaseModel):
    columns_description: List[ColumnDescription]
    rows: List[Tuple[Any, ...]]
