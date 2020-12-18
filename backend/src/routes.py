import os
from typing import List

from fastapi import HTTPException
from fastapi.routing import APIRouter
from pydantic.main import BaseModel
from starlette import status

from src import root_directory
from src.access_database_already_exist import AccessDatabaseAlreadyExist
from src.databases import create_access_database

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


class ListDatabasesResponse(BaseModel):
    names: List[str]


@databases.get("/databases", status_code=status.HTTP_200_OK)
def list_databases() -> ListDatabasesResponse:
    return ListDatabasesResponse(
        names=[
            file
            for file in os.listdir(databases_directory)
            if os.path.isfile(os.path.join(databases_directory, file))
        ]
    )
