import React, { useEffect, useState } from "react";
import { insertRowInDatabaseTable, readDatabaseTable } from "../api/api";
import { DatabaseTable } from "../api/models";
import { useParams } from "react-router-dom";
import { ColDef, DataGrid, RowModel, RowsProp } from "@material-ui/data-grid";
import { Button, makeStyles, Theme, Typography } from "@material-ui/core";
import { NewRowForm } from "./NewRowForm";

const useStyle = makeStyles((theme: Theme) => ({
    table: {
        height: 300,
    },
    root: {
        width: "100%",
        height: `calc(100% - 2 * ${theme.spacing(2)}px)`,
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        position: "relative",
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
            <Typography variant="h4" color="textSecondary" gutterBottom>
                {tableName}
            </Typography>
            <div className={classes.table}>
                <DataGrid
                    autoHeight
                    autoPageSize
                    rows={buildRows(table?.columns ?? [], table?.rows ?? [])}
                    columns={buildColumnsDefinition(table?.columns ?? [])}
                />
            </div>
            {!newRowOpened && (
                <Button onClick={() => setNewRowOpened(true)}>add row</Button>
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
        </div>
    );
}

function buildColumnsDefinition(columns: string[]): ColDef[] {
    return columns.map((column) => ({
        field: column,
        headerName: column,
        width: 200,
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
