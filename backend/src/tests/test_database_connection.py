import os
from tempfile import TemporaryDirectory

import pytest
from src.access_database_already_exist import AccessDatabaseAlreadyExist
from src.access_database_does_not_exist import AccessDatabaseDoesNotExist
from src.database_connection import connect_to_database, create_access_database


class TestCreateDatabase:
    def test_whenCreatingDatabase_thenDatabaseFileIsCreated(self):
        with TemporaryDirectory() as directory:
            a_database_path = os.path.join(str(directory), "name.mdb")
            create_access_database(a_database_path)

            assert os.path.exists(a_database_path) is True

    def test_givenDatabaseAlreadyExist_thenItShouldRaise(self):
        with TemporaryDirectory() as directory:
            a_database_path = os.path.join(str(directory), "name.mdb")
            create_access_database(a_database_path)

            with pytest.raises(AccessDatabaseAlreadyExist):
                create_access_database(a_database_path)


class TestConnectToDatabase:
    def test_givenDatabaseDoesnNotExist_whenConnecting_thenRaises(self):
        with TemporaryDirectory() as directory:
            a_database_path = os.path.join(str(directory), "name.mdb")
            with pytest.raises(AccessDatabaseDoesNotExist):
                connect_to_database(a_database_path)

    def test_whenConnecting_thenSuccess(self):
        with TemporaryDirectory() as directory:
            a_database_path = os.path.join(str(directory), "name.mdb")
            create_access_database(a_database_path)

            connection = connect_to_database(a_database_path)

            assert connection is not None
