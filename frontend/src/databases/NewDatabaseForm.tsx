import {
    Button,
    makeStyles,
    Paper,
    TextField,
    Theme,
    Typography,
} from "@material-ui/core";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        display: "grid",
        alignItems: "center",
        justifyContent: "center",
        gridTemplateRows: "1fr auto auto",
        gap: theme.spacing(2),
        padding: theme.spacing(2),
    },
    dropzone: ({ fileAccepted }: { fileAccepted: boolean }) => ({
        backgroundColor: theme.palette.grey[200],
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        borderStyle: "dotted",
        borderColor: fileAccepted ? theme.palette.success.main : "inherit",
        borderWidth: fileAccepted ? 2 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }),
    dropzoneContent: {
        fontWeight: theme.typography.fontWeightBold,
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    createButton: {
        marginLeft: theme.spacing(2),
    },
}));

interface Props {
    onCreate: (databaseName: string, databaseFile?: File) => void;
    className?: string;
}

export function NewDatabaseForm({ onCreate, className }: Props) {
    const [databaseFile, setDatabaseFile] = useState<File | undefined>();
    const [databaseName, setDatabaseName] = useState<string>("");
    const onDropAccepted = useCallback(
        (files) => {
            const file = files[0];
            if (file) {
                setDatabaseFile(file);
                databaseName === "" &&
                    setDatabaseName(file.name.replace(/\.mdb/, ""));
            }
        },
        [databaseName]
    );
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDropAccepted,
        accept: [
            "application/msaccess",
            "application/x-msaccess",
            "application/mdb",
            "application/x-mdb",
            "application/vnd.ms-access",
        ],
    });
    const classes = useStyle({ fileAccepted: databaseFile != null });

    const reset = () => {
        setDatabaseName("");
        setDatabaseFile(undefined);
    };

    return (
        <Paper className={className}>
            <form
                className={classes.root}
                onSubmit={(event) => {
                    event.preventDefault();
                    onCreate(databaseName, databaseFile);
                    reset();
                }}
            >
                <div className={classes.dropzone} {...getRootProps()}>
                    <input {...getInputProps()} data-testid="dropzone" />
                    {
                        <Typography className={classes.dropzoneContent}>
                            {databaseFile
                                ? databaseFile.name
                                : isDragActive
                                ? "Drop the file here ..."
                                : "Drag & drop a database file here, or click to select one"}
                        </Typography>
                    }
                </div>
                <TextField
                    value={databaseName}
                    inputProps={{ "aria-label": "Database name" }}
                    name={"Database name"}
                    placeholder={"Database name"}
                    onChange={(event) => setDatabaseName(event.target.value)}
                    label={"Database name"}
                />
                <div className={classes.actions}>
                    <Button
                        variant="outlined"
                        disabled={databaseName === ""}
                        onClick={reset}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className={classes.createButton}
                        variant="contained"
                        disableElevation
                        disabled={databaseName === ""}
                        color="primary"
                    >
                        Create
                    </Button>
                </div>
            </form>
        </Paper>
    );
}
