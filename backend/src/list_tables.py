from typing import List

from jaydebeapi import Connection
from pydantic.main import BaseModel


def list_tables(connection: Connection) -> List[str]:
    results = connection.jconn.getMetaData().getTables(None, None, "%", None)

    cursor = connection.cursor()
    cursor._rs = results
    cursor._meta = results.getMetaData()

    return [row[2] for row in cursor.fetchall() if row[3] == "TABLE"]


class DatabaseTablesSchema(BaseModel):
    tables: List[str]
