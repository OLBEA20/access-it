import os
from src.access_database_already_exist import AccessDatabaseAlreadyExist
from typing import List, Optional

import jaydebeapi
from jaydebeapi import Connection

from src import root_directory


def create_access_database(path: str) -> Connection:
    if os.path.exists(path):
        raise AccessDatabaseAlreadyExist()

    return _connect_to_database(path, ["newdatabaseversion=V2000"])


u_can_access_jars = [
    os.path.join(root_directory, "../UCanAccess/ucanaccess-5.0.0.jar"),
    os.path.join(root_directory, "../UCanAccess/lib/commons-lang3-3.8.1.jar"),
    os.path.join(root_directory, "../UCanAccess/lib/commons-logging-1.2.jar"),
    os.path.join(root_directory, "../UCanAccess/lib/hsqldb-2.5.0.jar"),
    os.path.join(root_directory, "../UCanAccess/lib/jackcess-3.0.1.jar"),
]


classpath = ":".join(u_can_access_jars)


def _connect_to_database(path: str, options: Optional[List[str]]) -> Connection:
    return jaydebeapi.connect(
        "net.ucanaccess.jdbc.UcanaccessDriver",
        f"jdbc:ucanaccess://{path};{';'.join(options)}",
        ["", ""],
        classpath,
    )