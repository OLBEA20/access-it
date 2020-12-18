import os
from src.access_database_already_exist import AccessDatabaseAlreadyExist

import pytest
from fastapi.testclient import TestClient
from src import root_directory
from main import application
from starlette.status import HTTP_201_CREATED, HTTP_409_CONFLICT

A_DATABASE_NAME = "database-name"


class TestCreate:
    def test_whenCreatingDatabase_thenDatabaseIsCreateInTheCorrectDirectory(
        self, test_client, mocked_create_access_database
    ):

        test_client.post("/databases", json={"name": A_DATABASE_NAME})

        mocked_create_access_database.assert_called_once_with(
            os.path.join(root_directory, f"../databases/{A_DATABASE_NAME}.mdb")
        )

    def test_whenCreatingDatabase_thenDatabaseNameShouldBeReturned(
        self, test_client, mocked_create_access_database
    ):
        response = test_client.post("/databases", json={"name": A_DATABASE_NAME})

        assert response.status_code == HTTP_201_CREATED
        assert response.json()["name"] == f"{A_DATABASE_NAME}.mdb"

    def test_givenDatabaseAlreadyExist_thenConflict(
        self, test_client, mocked_create_access_database
    ):
        mocked_create_access_database.side_effect = AccessDatabaseAlreadyExist

        response = test_client.post("/databases", json={"name": A_DATABASE_NAME})

        assert response.status_code == HTTP_409_CONFLICT


@pytest.fixture
def mocked_create_access_database(mocker):
    return mocker.patch("src.routes.create_access_database")


@pytest.fixture
def test_client():
    return TestClient(application)
