import { Button, makeStyles, TextField, Theme } from "@material-ui/core";
import React, { useState } from "react";

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
    columns: string[];
    onCancel: () => void;
    onSubmit: (values: object) => void;
}

export function NewRowForm({ columns, onCancel, onSubmit }: Props) {
    const classes = useStyle();
    const [values, setValues] = useState(
        columns.reduce((values, key) => ({ ...values, [key]: "" }), {})
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
                        key={column}
                        label={column}
                        value={values[column as keyof typeof values]}
                        onChange={(event) =>
                            setValues((prevValues) => ({
                                ...prevValues,
                                [column]: event.target.value,
                            }))
                        }
                        placeholder={column}
                        inputProps={{ "aria-label": column }}
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
