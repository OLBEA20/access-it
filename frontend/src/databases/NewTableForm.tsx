import React, { useState } from "react";
import { Button, makeStyles, Paper, TextField, Theme } from "@material-ui/core";
import { createDatabaseTable } from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import { DatabaseTableCreate, ColumnType } from "../api/models";
import { Autocomplete } from "@material-ui/lab";
import { ROUTES } from "../routes";

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2, 4),
    },
    columns: {
        margin: theme.spacing(4, 0),
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gridColumnGap: theme.spacing(4),
        gridRowGap: theme.spacing(4),
    },
    addColumn: { marginTop: theme.spacing(2) },
    form: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
    },
    actions: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
    },
}));

const DEFAULT_TABLE = { name: "", columns: [] };

export function NewTableForm() {
    const classes = useStyle();
    const navigate = useNavigate();

    const { databaseName } = useParams();
    const [table, setTable] = useState<DatabaseTableCreate>(DEFAULT_TABLE);

    return (
        <Paper className={classes.root} elevation={0} variant="outlined">
            <form
                aria-label="new-table"
                className={classes.form}
                onSubmit={(event) => {
                    event.preventDefault();
                    databaseName != null &&
                        createDatabaseTable(databaseName, table).then(() =>
                            navigate(
                                ROUTES.databaseTable(databaseName, table.name)
                            )
                        );
                }}
            >
                <TextField
                    label="Table name"
                    name="table-name"
                    placeholder="Table name"
                    inputProps={{ "aria-label": "table-name" }}
                    onChange={(event) =>
                        setTable((prevTable) => ({
                            name: event.target.value,
                            columns: prevTable.columns,
                        }))
                    }
                />
                <div className={classes.columns}>
                    {table.columns.map(({ name, type }, index) => (
                        <div key={index}>
                            <TextField
                                label={`Column name (${index})`}
                                name={`column-${index}-name`}
                                placeholder="Column name"
                                inputProps={{
                                    "aria-label": `column-${index}-name`,
                                }}
                                value={name}
                                onChange={(event) =>
                                    setTable((prevTable) => ({
                                        name: prevTable.name,
                                        columns: [
                                            ...prevTable.columns.slice(
                                                0,
                                                index
                                            ),
                                            { name: event.target.value, type },
                                            ...prevTable.columns.slice(
                                                index + 1
                                            ),
                                        ],
                                    }))
                                }
                            />
                            <Autocomplete
                                options={Object.values(ColumnType)}
                                onChange={(_, newValue) =>
                                    newValue != null &&
                                    setTable((prevTable) => ({
                                        name: prevTable.name,
                                        columns: [
                                            ...prevTable.columns.slice(
                                                0,
                                                index
                                            ),
                                            { name, type: newValue },
                                            ...prevTable.columns.slice(
                                                index + 1
                                            ),
                                        ],
                                    }))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={`Column type (${index})`}
                                        value={type}
                                        placeholder="Column type"
                                        inputProps={{
                                            ...params.inputProps,
                                            "aria-label": `column-${index}-type`,
                                        }}
                                    />
                                )}
                            />
                        </div>
                    ))}
                    <Button
                        className={classes.addColumn}
                        variant="outlined"
                        color="primary"
                        onClick={() =>
                            setTable((prevTable) => ({
                                ...prevTable,
                                columns: [
                                    ...prevTable.columns,
                                    { name: "", type: ColumnType.TEXT },
                                ],
                            }))
                        }
                    >
                        Add column
                    </Button>
                </div>

                <div className={classes.actions}>
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        disableElevation
                        disabled={
                            !table.name ||
                            table.columns.length === 0 ||
                            table.columns.some(({ name }) => name === "")
                        }
                    >
                        Create
                    </Button>
                </div>
            </form>
        </Paper>
    );
}
