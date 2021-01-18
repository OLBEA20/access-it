import {
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
import { AddOutlined, TocOutlined } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listDatabaseTables } from "../api/api";
import { ROUTES } from "../routes";

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        padding: theme.spacing(2),
        minWidth: 300,
        maxHeight: `calc(100% - 2 * ${theme.spacing(2)}px)`,
        alignItems: "flex-start",
    },
    title: {
        display: "flex",
        alignItems: "center",
    },
    tables: {
        overflowY: "auto",
        width: "100%",
    },
    actions: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
}));

export function DatabaseContainer() {
    const { databaseName } = useParams();
    const navigate = useNavigate();
    const classes = useStyle();
    const [tables, setTables] = useState<string[]>([]);

    useEffect(() => {
        listDatabaseTables(databaseName).then(({ tables }) =>
            setTables(tables)
        );
    }, [databaseName]);

    return (
        <Paper className={classes.root} variant="outlined" elevation={0}>
            <div className={classes.title}>
                <TocOutlined fontSize="large" />
                &nbsp;&nbsp;
                <Typography variant="h4">Tables</Typography>
            </div>
            <Divider />
            <List dense className={classes.tables}>
                {tables.map((name) => (
                    <ListItem
                        key={name}
                        button
                        disableGutters
                        onClick={() =>
                            navigate(ROUTES.databaseTable(databaseName, name))
                        }
                    >
                        <ListItemText>{name}</ListItemText>
                    </ListItem>
                ))}
            </List>
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
    );
}
