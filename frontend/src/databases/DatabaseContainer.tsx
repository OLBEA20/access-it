import {
    Button,
    CircularProgress,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Paper,
    Theme,
    Typography,
} from "@material-ui/core";
import {
    AddOutlined,
    ChevronRightRounded,
    TocOutlined,
} from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listDatabaseTables } from "../api/api";
import { ROUTES } from "../routes";

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        gap: theme.spacing(2, 2),
    },
    tablesContainer: {
        display: "flex",
        flexDirection: "column",
        padding: theme.spacing(2),
        minWidth: 300,
        alignItems: "flex-start",
        overflow: "auto",
    },
    title: {
        display: "flex",
        alignItems: "center",
    },
    tables: {
        overflowY: "auto",
        width: "100%",
    },
    progressContainer: {
        display: "flex",
        justifyContent: "center",
        width: "100%",
        padding: theme.spacing(2),
        boxSizing: "border-box",
    },
    actions: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    godModeContainer: {
        padding: theme.spacing(2),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    godModeButton: {
        display: "flex",
        alignItems: "center",
    },
}));

export function DatabaseContainer() {
    const { databaseName } = useParams();
    const navigate = useNavigate();
    const classes = useStyle();
    const [tables, setTables] = useState<string[]>([]);
    const [tablesAreLoading, setTablesAreLoading] = useState<boolean>(false);

    useEffect(() => {
        setTablesAreLoading(true);
        listDatabaseTables(databaseName)
            .then(({ tables }) => setTables(tables))
            .finally(() => setTablesAreLoading(false));
    }, [databaseName]);

    return (
        <div className={classes.root}>
            <Paper
                className={classes.tablesContainer}
                variant="outlined"
                elevation={0}
            >
                <div className={classes.title}>
                    <TocOutlined fontSize="large" />
                    &nbsp;&nbsp;
                    <Typography variant="h4">Tables</Typography>
                </div>
                <Divider style={{ width: "100%" }} />
                {tablesAreLoading ? (
                    <div className={classes.progressContainer}>
                        <CircularProgress />
                    </div>
                ) : (
                    <List dense className={classes.tables}>
                        {tables.map((name) => (
                            <ListItem
                                key={name}
                                button
                                disableGutters
                                onClick={() =>
                                    navigate(
                                        ROUTES.databaseTable(databaseName, name)
                                    )
                                }
                            >
                                <ListItemText>{name}</ListItemText>
                            </ListItem>
                        ))}
                    </List>
                )}

                <div className={classes.actions}>
                    <IconButton
                        color="primary"
                        aria-label="add-table"
                        onClick={() => navigate(ROUTES.newDatabaseTable())}
                    >
                        <AddOutlined />
                    </IconButton>
                </div>
            </Paper>
            <Paper
                variant="outlined"
                elevation={0}
                className={classes.godModeContainer}
            >
                <Button
                    className={classes.godModeButton}
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={() =>
                        navigate(ROUTES.databaseGodMode(databaseName))
                    }
                >
                    God mode
                    <ChevronRightRounded />
                </Button>
            </Paper>
        </div>
    );
}
