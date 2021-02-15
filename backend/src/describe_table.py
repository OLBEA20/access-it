from __future__ import annotations

from typing import List
from pydantic import BaseModel
from jaydebeapi import Connection


def describe_table(table_name: str, connection: Connection) -> TableDescription:
    cursor = connection.cursor()
    cursor.execute(f"SELECT * FROM {table_name};")

    return TableDescription(
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
        ]
    )


class ColumnDescription(BaseModel):
    name: str
    type_code: str
    display_size: int
    internal_size: int
    precision: int
    scale: int
    nullable: bool


class TableDescription(BaseModel):
    columns_description: List[ColumnDescription]
