import {
    Divider,
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Paper,
    Theme,
    Typography,
} from "@material-ui/core";
import { StorageOutlined } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { createDatabase, listDatabases } from "../api/api";
import { NewResourceInput } from "../commons/components/NewResourceInput";
import { ROUTES } from "../routes";

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        alignItems: "flex-start",
        height: "100%",
    },
    databases: {
        display: "flex",
        flexDirection: "column",
        padding: theme.spacing(2),
        marginRight: theme.spacing(2),
        minWidth: 300,
    },
    selectedDatabase: {
        backgroundColor: theme.palette.action.selected,
    },
    title: {
        display: "flex",
        alignItems: "center",
    },
}));

export function DatabasesContainer() {
    const classes = useStyle();
    const [databases, setDatabases] = useState<string[]>([]);
    const navigate = useNavigate();
    const params = useMatch("/databases/:databaseName")?.params;

    useEffect(() => {
        listDatabases().then(({ names }) => setDatabases(names));
    }, []);

    return (
        <div className={classes.root}>
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
                <List dense>
                    {databases.map((name) => (
                        <ListItem
                            key={name}
                            className={
                                name === params?.["databaseName"]
                                    ? classes.selectedDatabase
                                    : undefined
                            }
                            button
                            disableGutters
                            data-testid={`database-item`}
                            onClick={() => navigate(ROUTES.database(name))}
                        >
                            <ListItemText>{name}</ListItemText>
                        </ListItem>
                    ))}
                </List>
                <NewResourceInput
                    onSave={(name) =>
                        createDatabase(name)
                            .then(({ name }) =>
                                setDatabases((databases) => [
                                    ...databases,
                                    name,
                                ])
                            )
                            .catch(silenceError)
                    }
                />
            </Paper>
            <Outlet />
        </div>
    );
}

const silenceError = () => {};
