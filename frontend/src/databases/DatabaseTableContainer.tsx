import { useEffect, useState } from "react";
import { insertRowInDatabaseTable, readDatabaseTable } from "../api/api";
import { SelectStatementResults } from "../api/models";
import { useParams } from "react-router-dom";
import {
    Button,
    IconButton,
    makeStyles,
    Paper,
    Theme,
    Typography,
} from "@material-ui/core";
import { NewRowForm } from "./NewRowForm";
import { TableDescriptionDialog } from "./TableDescriptionDialog";
import { DescriptionOutlined } from "@material-ui/icons";
import { SelectStatementResult } from "./query/SelectStatementResult";

const useStyle = makeStyles((theme: Theme) => ({
    table: {
        flexGrow: 1,
    },
    tableContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: theme.spacing(2),
    },
    tableContainerHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    pairRow: {
        backgroundColor: theme.palette.grey[100],
    },
    newRowContainer: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    root: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
    },
}));

export function DatabaseTableContainer() {
    const { databaseName, tableName } = useParams();
    const classes = useStyle();
    const [result, setResult] = useState<SelectStatementResults | undefined>();
    const [tableDescriptionOpen, setTableDescriptionOpen] =
        useState<boolean>(false);
    const [newRowOpened, setNewRowOpened] = useState<boolean>(false);

    useEffect(() => {
        databaseName != null &&
            tableName != null &&
            readDatabaseTable(databaseName, tableName).then(setResult);
    }, [databaseName, tableName]);

    return (
        <div className={classes.root}>
            <TableDescriptionDialog
                open={tableDescriptionOpen}
                onClose={() => setTableDescriptionOpen(false)}
                columnsDescription={result?.columns_description ?? []}
            />
            <Paper className={classes.tableContainer} elevation={0}>
                <div className={classes.tableContainerHeader}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                        {tableName}
                    </Typography>
                    <IconButton
                        onClick={() => setTableDescriptionOpen(true)}
                        aria-label="Description"
                        color="primary"
                    >
                        <DescriptionOutlined />
                    </IconButton>
                </div>
                <div className={classes.table}>
                    {result && (
                        <SelectStatementResult selectStatementResult={result} />
                    )}
                </div>
            </Paper>
            <Paper className={classes.newRowContainer} elevation={0}>
                {!newRowOpened && (
                    <Button
                        onClick={() => setNewRowOpened(true)}
                        variant="contained"
                        disableElevation
                        color="primary"
                    >
                        add row
                    </Button>
                )}
                {newRowOpened && (
                    <NewRowForm
                        columns={result?.columns_description ?? []}
                        onCancel={() => setNewRowOpened(false)}
                        onSubmit={(values) => {
                            databaseName != null &&
                                tableName != null &&
                                insertRowInDatabaseTable(
                                    databaseName,
                                    tableName,
                                    Object.entries(values).map(
                                        ([key, value]) => [key, value]
                                    )
                                );
                            setNewRowOpened(false);
                        }}
                    />
                )}
            </Paper>
        </div>
    );
}
