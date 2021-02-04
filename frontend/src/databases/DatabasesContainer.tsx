import {
    Divider,
    List,
    makeStyles,
    Paper,
    Theme,
    Typography,
} from "@material-ui/core";
import { StorageOutlined } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { createDatabase, deleteDatabase, listDatabases } from "../api/api";
import { DatabaseRow } from "./DatabaseRow";
import { NewDatabaseForm } from "./NewDatabaseForm";

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        alignItems: "flex-start",
        height: "100%",
    },
    databasesContainer: {
        display: "flex",
        flexDirection: "column",
        maxWidth: 330,
        marginRight: theme.spacing(2),
        height: "100%",
    },
    databases: {
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        padding: theme.spacing(2),
    },
    list: {
        overflow: "auto",
    },
    newDatabaseForm: {
        marginTop: theme.spacing(2),
    },

    title: {
        display: "flex",
        alignItems: "center",
    },
}));

export function DatabasesContainer() {
    const classes = useStyle();
    const [databases, setDatabases] = useState<string[]>([]);
    const params = useMatch("/databases/:databaseName")?.params;

    useEffect(() => {
        listDatabases().then(({ names }) => setDatabases(names));
    }, []);

    return (
        <div className={classes.root}>
            <div className={classes.databasesContainer}>
                <Paper
                    className={classes.databases}
                    variant="outlined"
                    elevation={0}
                >
                    <div className={classes.title}>
                        <StorageOutlined fontSize="large" />
                        &nbsp;&nbsp;
                        <Typography variant="h4">Databases</Typography>
                    </div>
                    <Divider />
                    <List dense className={classes.list}>
                        {databases.map((name) => (
                            <DatabaseRow
                                key={name}
                                name={name}
                                selected={name === params?.["databaseName"]}
                                onDelete={() =>
                                    deleteDatabase(name).then(({ names }) =>
                                        setDatabases(names)
                                    )
                                }
                            />
                        ))}
                    </List>
                </Paper>
                <NewDatabaseForm
                    className={classes.newDatabaseForm}
                    onCreate={(databaseName, databaseFile) =>
                        createDatabase(databaseName, databaseFile)
                            .then(({ name }) =>
                                setDatabases((names) => [...names, name])
                            )
                            .catch(silenceError)
                    }
                />
            </div>
            <Outlet />
        </div>
    );
}

const silenceError = () => {};
