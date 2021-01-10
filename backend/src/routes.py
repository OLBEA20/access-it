import os
from src.insert_row import TableRow, insert_row

from starlette.responses import Response
from src.read_table import TableSchema, read_table
from typing import List

from fastapi import HTTPException
from fastapi.routing import APIRouter
from pydantic.main import BaseModel
from starlette import status

from src import root_directory
from src.access_database_already_exist import AccessDatabaseAlreadyExist
from src.access_database_does_not_exist import AccessDatabaseDoesNotExist
from src.create_table import CreateDatabaseTableSchema, create_table
from src.database_connection import connect_to_database, create_access_database
from src.list_tables import DatabaseTablesSchema, list_tables

databases = APIRouter()

databases_directory = os.path.join(root_directory, "../databases")


class CreateDatabaseRequest(BaseModel):
    name: str


class CreateDatabaseResponse(BaseModel):
    name: str


@databases.post("/databases", status_code=status.HTTP_201_CREATED)
def create_database(request: CreateDatabaseRequest) -> CreateDatabaseResponse:
    try:
        create_access_database(os.path.join(databases_directory, f"{request.name}.mdb"))
    except AccessDatabaseAlreadyExist:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Access database already exist"
        )

    return CreateDatabaseResponse(name=f"{request.name}.mdb")


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


class ListDatabasesResponse(BaseModel):
    names: List[str]


@databases.get("/databases", status_code=status.HTTP_200_OK)
def list_databases() -> ListDatabasesResponse:
    return ListDatabasesResponse(
        names=[
            file.replace(".mdb", "")
            for file in os.listdir(databases_directory)
            if os.path.isfile(os.path.join(databases_directory, file))
        ]
    )
