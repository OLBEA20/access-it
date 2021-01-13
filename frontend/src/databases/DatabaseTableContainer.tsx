import React, { useEffect, useState } from "react";
import { insertRowInDatabaseTable, readDatabaseTable } from "../api/api";
import { DatabaseTable } from "../api/models";
import { useParams } from "react-router-dom";
import {
    CellClassParams,
    ColDef,
    DataGrid,
    RowModel,
    RowsProp,
} from "@material-ui/data-grid";
import {
    Button,
    makeStyles,
    Paper,
    Theme,
    Typography,
} from "@material-ui/core";
import { NewRowForm } from "./NewRowForm";
import clsx from "clsx";

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
    header: {
        backgroundColor: theme.palette.primary.light,
        width: "auto",
    },
    row: {
        fontWeight: theme.typography.fontWeightBold,
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
        width: "100%",
        height: `calc(100% - 2 * ${theme.spacing(2)}px)`,
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
    },
}));

export function DatabaseTableContainer() {
    const { databaseName, tableName } = useParams();
    const classes = useStyle();
    const [table, setTable] = useState<DatabaseTable | undefined>();
    const [newRowOpened, setNewRowOpened] = useState<boolean>(false);

    useEffect(() => {
        readDatabaseTable(databaseName, tableName).then(setTable);
    }, [databaseName, tableName]);

    return (
        <div className={classes.root}>
            <Paper className={classes.tableContainer}>
                <Typography variant="h4" color="textSecondary" gutterBottom>
                    {tableName}
                </Typography>
                <div className={classes.table}>
                    <DataGrid
                        autoPageSize
                        rows={buildRows(
                            table?.columns ?? [],
                            table?.rows ?? []
                        )}
                        columns={buildColumnsDefinition(
                            table?.columns ?? [],
                            classes.header,
                            (params: CellClassParams) =>
                                clsx(
                                    classes.row,
                                    (params.rowIndex ?? 0) % 2 === 0
                                        ? classes.pairRow
                                        : undefined
                                )
                        )}
                    />
                </div>
            </Paper>
            <Paper className={classes.newRowContainer}>
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
                        columns={table?.columns ?? []}
                        onCancel={() => setNewRowOpened(false)}
                        onSubmit={(values) => {
                            insertRowInDatabaseTable(
                                databaseName,
                                tableName,
                                Object.entries(values).map(([key, value]) => [
                                    key,
                                    value,
                                ])
                            );
                            setNewRowOpened(false);
                        }}
                    />
                )}
            </Paper>
        </div>
    );
}

function buildColumnsDefinition(
    columns: string[],
    headerClassName: string,
    getCellClassName: (params: CellClassParams) => string
): ColDef[] {
    return columns.map((column) => ({
        field: column,
        flex: 1,
        headerName: column,
        headerClassName,
        cellClassName: getCellClassName,
    }));
}

function buildRows(
    columns: string[],
    rows: (string | number | boolean | null)[][]
): RowsProp {
    return rows.map(
        (row, id) =>
            row.reduce(
                (def, value, index) => ({
                    ...def,
                    id,
                    [columns[index]]: value,
                }),
                {}
            ) as RowModel
    );
}
