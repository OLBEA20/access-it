import io
import os
from typing import List, Optional

from fastapi import HTTPException
from fastapi.params import File
from fastapi.routing import APIRouter
from jaydebeapi import Cursor
from pydantic.main import BaseModel
from starlette import status
from starlette.responses import Response, StreamingResponse

from src import root_directory
from src.access_database_already_exist import AccessDatabaseAlreadyExist
from src.access_database_does_not_exist import AccessDatabaseDoesNotExist
from src.create_table import CreateDatabaseTableSchema, create_table
from src.database_connection import connect_to_database, create_access_database
from src.insert_row import TableRow, insert_row
from src.list_tables import DatabaseTablesSchema, list_tables
from src.read_table import ColumnDescription, TableSchema, read_table

databases = APIRouter()

databases_directory = os.path.join(root_directory, "../databases")


class CreateDatabaseRequest(BaseModel):
    name: str


class CreateDatabaseResponse(BaseModel):
    name: str


class ListDatabasesResponse(BaseModel):
    names: List[str]


class DatabaseStatement(BaseModel):
    statement: str


@databases.get("/databases", status_code=status.HTTP_200_OK)
def list_databases() -> ListDatabasesResponse:
    return ListDatabasesResponse(
        names=[
            file.replace(".mdb", "")
            for file in os.listdir(databases_directory)
            if os.path.isfile(os.path.join(databases_directory, file))
        ]
    )


@databases.get("/databases/{name}", status_code=status.HTTP_200_OK)
def download_database(name) -> StreamingResponse:
    try:
        return StreamingResponse(
            content=io.BytesIO(read_database_file(name)),
            media_type="application/vnd.ms-access",
            headers={
                "Content-Disposition": f"attachment; filename={name}",
            },
        )
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


@databases.put("/databases/{name}", status_code=status.HTTP_201_CREATED)
def create_database(
    name, database_file: Optional[bytes] = File(None)
) -> CreateDatabaseResponse:
    try:
        if database_file is not None:
            write_database_file(name, database_file)
        else:
            create_access_database(os.path.join(databases_directory, f"{name}.mdb"))
    except (AccessDatabaseAlreadyExist, FileExistsError):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Access database already exist"
        )

    return CreateDatabaseResponse(name=f"{name}")


@databases.delete("/databases/{name}", status_code=status.HTTP_200_OK)
def delete_database(name) -> ListDatabasesResponse:
    remove_database_file(name)
    return ListDatabasesResponse(
        names=[
            file.replace(".mdb", "")
            for file in os.listdir(databases_directory)
            if os.path.isfile(os.path.join(databases_directory, file))
        ]
    )


@databases.post("/databases/{name}/update", status_code=status.HTTP_200_OK)
def update_rows(name, update_query: DatabaseStatement) -> None:
    _execute_statement(name, update_query)


@databases.post("/databases/{name}/delete", status_code=status.HTTP_200_OK)
def delete_rows(name, delete_query: DatabaseStatement) -> None:
    _execute_statement(name, delete_query)


@databases.post("/databases/{name}/insert", status_code=status.HTTP_200_OK)
def insert_rows(name, delete_query: DatabaseStatement) -> None:
    _execute_statement(name, delete_query)


@databases.post("/databases/{name}/select", status_code=status.HTTP_200_OK)
def select_rows(name, delete_query: DatabaseStatement) -> TableSchema:
    cursor = _execute_statement(name, delete_query)
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


def _execute_statement(name: str, query: DatabaseStatement) -> Cursor:
    try:
        connection = connect_to_database(
            os.path.join(databases_directory, f"{name}.mdb")
        )
        cursor: Cursor = connection.cursor()
        cursor.execute(query.statement)
        return cursor
    except AccessDatabaseDoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access database does not exist",
        )


@databases.post("/databases/{name}/tables", status_code=status.HTTP_204_NO_CONTENT)
def create_table_in_database(name: str, request: CreateDatabaseTableSchema) -> None:
    try:
        connection = connect_to_database(
            os.path.join(databases_directory, f"{name}.mdb")
        )
        create_table(request, connection)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except AccessDatabaseDoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access database does not exist",
        )


@databases.get("/databases/{name}/tables", status_code=status.HTTP_200_OK)
def list_tables_in_database(name: str) -> DatabaseTablesSchema:
    try:
        connection = connect_to_database(
            os.path.join(databases_directory, f"{name}.mdb")
        )
        return DatabaseTablesSchema(tables=list_tables(connection))
    except AccessDatabaseDoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access database does not exist",
        )


@databases.get("/databases/{name}/tables/{table_name}", status_code=status.HTTP_200_OK)
def read_database_table(name: str, table_name: str) -> TableSchema:
    try:
        connection = connect_to_database(
            os.path.join(databases_directory, f"{name}.mdb")
        )
        return read_table(table_name, connection)
    except AccessDatabaseDoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access database does not exist",
        )


@databases.post(
    "/databases/{name}/tables/{table_name}/rows", status_code=status.HTTP_200_OK
)
def insert_database_table_row(name: str, table_name: str, row: TableRow) -> TableRow:
    try:
        connection = connect_to_database(
            os.path.join(databases_directory, f"{name}.mdb")
        )
        insert_row(table_name, row, connection)
        return row
    except AccessDatabaseDoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access database does not exist",
        )


def write_database_file(filename: str, database_file: bytes) -> None:
    with open(os.path.join(databases_directory, f"{filename}.mdb"), "xb") as file:
        file.write(database_file)


def remove_database_file(filename: str) -> None:
    os.remove(os.path.join(databases_directory, f"{filename}.mdb"))


def read_database_file(filename: str) -> bytes:
    with open(os.path.join(databases_directory, f"{filename}.mdb"), "rb") as file:
        return file.read()
