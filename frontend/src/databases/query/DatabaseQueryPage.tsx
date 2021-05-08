import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
    Button,
    Input,
    makeStyles,
    Paper,
    Theme,
    Typography,
} from "@material-ui/core";
import { useParams } from "react-router-dom";
import { updateDatabase } from "../../api/api";

enum StatementResultStatus {
    SUCCESS = "success",
    FAILED = "failed",
}

interface StatementResult {
    status: StatementResultStatus;
    message: string;
}

const useStyle = makeStyles<Theme, { status: StatementResultStatus }>(
    (theme: Theme) => ({
        root: {
            padding: theme.spacing(2),
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(2),
        },
        statementInputContainer: {
            display: "grid",
            gridTemplateAreas: '"center"',
        },
        statementInput: {
            gridArea: "center",
            margin: "0.5em 0px",
            padding: "1.25em 1em",
            lineHeight: "1.5em",
            letterSpacing: "inherit",
            "& > *": {
                fontFamily: '"Roboto Mono", monospace',
                color: "transparent",
                background: "transparent",
                caretColor: "white",
            },
        },
        statementCode: {
            gridArea: "center",
        },
        result: ({ status }) => ({
            paddingLeft: theme.spacing(1),
            color:
                status === StatementResultStatus.SUCCESS
                    ? theme.palette.success.main
                    : theme.palette.error.main,
            fontWeight: theme.typography.fontWeightBold,
        }),
        actions: {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
        },
    })
);

export function DatabaseQueryPage() {
    const [result, setResult] = useState<StatementResult | undefined>();
    const classes = useStyle({
        status: result?.status ?? StatementResultStatus.SUCCESS,
    });
    const { databaseName } = useParams();
    const [statement, setStatement] = useState<string>("");

    return (
        <Paper className={classes.root} variant="outlined" elevation={0}>
            <div className={classes.statementInputContainer}>
                <SyntaxHighlighter
                    className={classes.statementCode}
                    language="sql"
                    style={materialDark}
                >
                    {statement}
                </SyntaxHighlighter>
                <Input
                    className={classes.statementInput}
                    classes={{ root: classes.statementInput }}
                    fullWidth
                    multiline
                    aria-label="statement"
                    onChange={(event) => setStatement(event.target.value)}
                />
            </div>
            {result != null ? (
                <Typography className={classes.result}>
                    {result.message}
                </Typography>
            ) : null}
            <div className={classes.actions}>
                <Button
                    disableElevation
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setResult(undefined);
                        submitStatement(databaseName, statement).then(
                            setResult
                        );
                    }}
                >
                    Execute
                </Button>
            </div>
        </Paper>
    );
}

function submitStatement(
    databaseName: string,
    statement: string
): Promise<StatementResult> {
    if (statement.toLocaleLowerCase().startsWith("update")) {
        return updateDatabase(databaseName, statement)
            .then(() => ({
                status: StatementResultStatus.SUCCESS,
                message: "UPDATE SUCCESSFUL!!!",
            }))
            .catch(() => ({
                status: StatementResultStatus.FAILED,
                message: "UPDATE FAILED!!!",
            }));
    }
    return Promise.resolve({
        status: StatementResultStatus.SUCCESS,
        message: "",
    });
}
