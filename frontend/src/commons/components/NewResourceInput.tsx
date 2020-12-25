import { IconButton, makeStyles, TextField } from "@material-ui/core";
import { AddOutlined, SaveOutlined } from "@material-ui/icons";
import React, { useState } from "react";

const useStyle = makeStyles(() => ({
    root: {
        display: "flex",
        alignItems: "center",
    },
}));

interface Props {
    onSave: (value: string) => void;
}

export function NewResourceInput({ onSave }: Props) {
    const classes = useStyle();
    const [inputOpen, setInputOpen] = useState<boolean>(false);
    const [name, setName] = useState<string>("");

    const submitForm = () => {
        onSave(name);
        setInputOpen(false);
    };

    return (
        <div className={classes.root}>
            {inputOpen ? (
                <>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            submitForm();
                        }}
                        aria-label="newResource"
                    >
                        <TextField
                            autoFocus
                            id="name"
                            required
                            value={name}
                            onKeyDown={(event) => {
                                event.key === "Enter" && submitForm();
                                event.key === "Escape" && setInputOpen(false);
                            }}
                            onChange={(event) => setName(event.target.value)}
                        />
                        <IconButton
                            aria-label="save"
                            type="submit"
                            color="primary"
                        >
                            <SaveOutlined />
                        </IconButton>
                    </form>
                </>
            ) : (
                <IconButton
                    aria-label="addResource"
                    onClick={() => setInputOpen(true)}
                    color="primary"
                >
                    <AddOutlined />
                </IconButton>
            )}
        </div>
    );
}
