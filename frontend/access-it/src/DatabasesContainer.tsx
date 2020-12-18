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
import { createDatabase, listDatabases } from "./api";
import { NewResourceInput } from "./commons/components/NewResourceInput";

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        padding: theme.spacing(2),
        minWidth: 300,
    },
    title: {
        display: "flex",
        alignItems: "center",
    },
}));

export function DatabasesContainer() {
    const classes = useStyle();
    const [databases, setDatabases] = useState<string[]>([]);

    useEffect(() => {
        listDatabases().then(({ names }) => setDatabases(names));
    }, []);

    return (
        <Paper className={classes.root} variant="outlined" elevation={0}>
            <div className={classes.title}>
                <StorageOutlined fontSize="large" />
                &nbsp;&nbsp;
                <Typography variant="h4">Databases</Typography>
            </div>
            <Divider />
            <List dense>
                {databases.map((name) => (
                    <ListItem key={name} button disableGutters>
                        <ListItemText>{name}</ListItemText>
                    </ListItem>
                ))}
            </List>
            <NewResourceInput
                onSave={async (name) => {
                    const databaseName = (await createDatabase(name)).name;
                    setDatabases((databases) => [...databases, databaseName]);
                }}
            />
        </Paper>
    );
}
