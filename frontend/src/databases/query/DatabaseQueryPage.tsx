import React, { useState } from "react";
import { Button, makeStyles, Paper, TextField, Theme } from "@material-ui/core";
import { useParams } from "react-router-dom";
import { updateDatabase } from "../../api/api";

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2, 2),
    },
    actions: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    statementField: {
        minWidth: 500,
    },
}));

export function DatabaseQueryPage() {
    const classes = useStyle();
    const { databaseName } = useParams();
    const [statement, setStatement] = useState<string>("");

    return (
        <Paper className={classes.root} variant="outlined" elevation={0}>
            <TextField
                fullWidth
                multiline
                variant="outlined"
                label="Statement"
                aria-label="statement"
                onChange={(event) => setStatement(event.target.value)}
            />
            <div className={classes.actions}>
                <Button
                    disableElevation
                    variant="contained"
                    color="primary"
                    onClick={() => submitStatement(databaseName, statement)}
                >
                    Execute
                </Button>
            </div>
        </Paper>
    );
}

function submitStatement(databaseName: string, statement: string) {
    if (statement.toLocaleLowerCase().startsWith("update")) {
        return updateDatabase(databaseName, statement);
    }
}
