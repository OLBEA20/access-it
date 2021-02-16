import { Button, makeStyles, TextField, Theme } from "@material-ui/core";
import React, { useState } from "react";
import { ColumnDescription } from "../api/models";

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        display: "grid",
        alignItems: "center",
        justifyItems: "center",
        gridTemplateColumns: "repeat(10, 1fr)",
        gridRowGap: theme.spacing(2),
        gridColumnGap: theme.spacing(2),
    },
    actions: {
        marginTop: theme.spacing(2),
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    save: {
        marginLeft: theme.spacing(2),
    },
}));

interface Props {
    columns: ColumnDescription[];
    onCancel: () => void;
    onSubmit: (values: object) => void;
}

export function NewRowForm({ columns, onCancel, onSubmit }: Props) {
    const classes = useStyle();
    const [values, setValues] = useState(
        columns.reduce((values, key) => ({ ...values, [key.name]: "" }), {})
    );

    return (
        <form
            aria-label="new row"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit(values);
            }}
        >
            <div className={classes.root}>
                {columns.map((column) => (
                    <TextField
                        key={column.name}
                        label={column.name}
                        value={values[column.name as keyof typeof values]}
                        onChange={(event) =>
                            setValues((prevValues) => ({
                                ...prevValues,
                                [column.name]: event.target.value,
                            }))
                        }
                        placeholder={column.name}
                        inputProps={{ "aria-label": column.name }}
                    />
                ))}
            </div>
            <div className={classes.actions}>
                <Button onClick={onCancel} variant="outlined">
                    Cancel
                </Button>
                <Button
                    className={classes.save}
                    type="submit"
                    color="primary"
                    variant="contained"
                    disableElevation
                >
                    Add
                </Button>
            </div>
        </form>
    );
}
