import { makeStyles, Theme } from "@material-ui/core";
import { DataGrid, GridColumns, GridRowData } from "@material-ui/data-grid";
import { ColumnDescription, SelectStatementResults } from "../../api/models";
import { useWindowSize } from "../../utils/useWindowSize";

const useStyle = makeStyles((theme: Theme) => ({
    header: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main),
    },
}));

interface Props {
    selectStatementResult: SelectStatementResults;
}

export function SelectStatementResult({ selectStatementResult }: Props) {
    const classes = useStyle();
    const { width } = useWindowSize();

    return (
        <DataGrid
            disableColumnSelector={false}
            autoPageSize
            rows={buildRows(
                selectStatementResult?.columns_description ?? [],
                selectStatementResult?.rows ?? []
            )}
            columns={buildColumnsDefinition(
                selectStatementResult?.columns_description ?? [],
                width ?? 0,
                classes.header
            )}
        />
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
