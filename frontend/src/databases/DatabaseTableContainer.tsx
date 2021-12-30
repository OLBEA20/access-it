import { useEffect, useState } from "react";
import { insertRowInDatabaseTable, readDatabaseTable } from "../api/api";
import { ColumnDescription, DatabaseTable } from "../api/models";
import { useParams } from "react-router-dom";
import { DataGrid, GridColumns, GridRowData } from "@material-ui/data-grid";
import {
    Button,
    IconButton,
    makeStyles,
    Paper,
    Theme,
    Typography,
} from "@material-ui/core";
import { NewRowForm } from "./NewRowForm";
import { useWindowSize } from "../utils/useWindowSize";
import { TableDescriptionDialog } from "./TableDescriptionDialog";
import { DescriptionOutlined } from "@material-ui/icons";

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
    header: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main),
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
    const [table, setTable] = useState<DatabaseTable | undefined>();
    const [tableDescriptionOpen, setTableDescriptionOpen] =
        useState<boolean>(false);
    const [newRowOpened, setNewRowOpened] = useState<boolean>(false);
    const { width } = useWindowSize();

    useEffect(() => {
        databaseName != null &&
            tableName != null &&
            readDatabaseTable(databaseName, tableName).then(setTable);
    }, [databaseName, tableName]);

    return (
        <div className={classes.root}>
            <TableDescriptionDialog
                open={tableDescriptionOpen}
                onClose={() => setTableDescriptionOpen(false)}
                columnsDescription={table?.columns_description ?? []}
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
                    <DataGrid
                        disableColumnSelector={false}
                        autoPageSize
                        rows={buildRows(
                            table?.columns_description ?? [],
                            table?.rows ?? []
                        )}
                        columns={buildColumnsDefinition(
                            table?.columns_description ?? [],
                            width ?? 0,
                            classes.header
                        )}
                    />
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
                        columns={table?.columns_description ?? []}
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

function buildColumnsDefinition(
    columns: ColumnDescription[],
    windowWith: number,
    headerClassName: string
): GridColumns {
    const isWideEnoughtToUseFlex = windowWith / columns.length > 150;
    return columns.map((column) => ({
        field: column.name,
        flex: isWideEnoughtToUseFlex ? 1 : undefined,
        width: !isWideEnoughtToUseFlex ? 150 : undefined,
        headerName: column.name,
        headerClassName,
        renderCell: (params: any) => (
            <strong title={params.value?.toString() ?? ""}>
                {params.value?.toString()}
            </strong>
        ),
    }));
}

function buildRows(
    columns: ColumnDescription[],
    rows: (string | number | boolean | null)[][]
): GridRowData[] {
    return rows.map(
        (row, id) =>
            row.reduce(
                (def, value, index) => ({
                    ...def,
                    id,
                    [columns[index].name]: value,
                }),
                {}
            ) as GridRowData
    );
}
