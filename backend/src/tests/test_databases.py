import os
from tempfile import TemporaryDirectory

import pytest
from src.access_database_already_exist import AccessDatabaseAlreadyExist
from src.databases import create_access_database


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
