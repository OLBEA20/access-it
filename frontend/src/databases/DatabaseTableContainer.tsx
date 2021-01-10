import React, { useEffect, useState } from "react";
import { readDatabaseTable } from "../api/api";
import { DatabaseTable } from "../api/models";
import { useParams } from "react-router-dom";
import { ColDef, DataGrid, RowModel, RowsProp } from "@material-ui/data-grid";
import { Button, makeStyles, Theme, Typography } from "@material-ui/core";

const useStyle = makeStyles((theme: Theme) => ({
    table: {},
    root: {
        width: "100%",
        height: `calc(100% - 2 * ${theme.spacing(2)}px)`,
        padding: theme.spacing(2),
    },
}));

export function DatabaseTableContainer() {
    const { databaseName, tableName } = useParams();
    const classes = useStyle();
    const [table, setTable] = useState<DatabaseTable | undefined>();

    useEffect(() => {
        readDatabaseTable(databaseName, tableName).then(setTable);
    }, [databaseName, tableName]);

    return (
        <div className={classes.root}>
            <Typography variant="h4" color="textSecondary" gutterBottom>
                {tableName}
            </Typography>
            <DataGrid
                className={classes.table}
                autoHeight
                autoPageSize
                rows={buildRows(table?.columns ?? [], table?.rows ?? [])}
                columns={buildColumnsDefinition(table?.columns ?? [])}
            />
            <Button>add row</Button>
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
