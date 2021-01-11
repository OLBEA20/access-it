import { Button, TextField } from "@material-ui/core";
import React, { useState } from "react";

interface Props {
    columns: string[];
    onCancel: () => void;
    onSubmit: (values: object) => void;
}

export function NewRowForm({ columns, onCancel, onSubmit }: Props) {
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
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit">Add</Button>
        </form>
    );
}
