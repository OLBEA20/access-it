import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SelectStatementResult } from "./SelectStatementResult";

import {
    Button,
    Input,
    makeStyles,
    Paper,
    Theme,
    Typography,
} from "@material-ui/core";
import { useParams } from "react-router-dom";
import {
    insertDatabaseRows,
    deleteDatabaseRows,
    updateDatabase,
    selectDatabaseRows,
} from "../../api/api";
import { SelectStatementResults } from "../../api/models";

enum StatementResultStatus {
    SUCCESS = "success",
    FAILED = "failed",
}

interface StatementResult {
    status: StatementResultStatus;
    message: string;
    result: undefined | SelectStatementResults;
}

const useStyle = makeStyles<Theme, { status: StatementResultStatus }>(
    (theme: Theme) => ({
        root: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: theme.spacing(2),
        },
        queryContainer: {
            padding: theme.spacing(2),
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(2),
        },
        resultContainer: {
            flex: 2,
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
            fontWeight: 900,
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
        <div className={classes.root}>
            <Paper
                className={classes.queryContainer}
                variant="outlined"
                elevation={0}
            >
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
                            databaseName != null &&
                                submitStatement(databaseName, statement).then(
                                    setResult
                                );
                        }}
                    >
                        Execute
                    </Button>
                </div>
            </Paper>
            <Paper className={classes.resultContainer}>
                {result?.result && (
                    <SelectStatementResult
                        selectStatementResult={result?.result}
                    />
                )}
            </Paper>
        </div>
    );
}

async function submitStatement(
    databaseName: string,
    statement: string
): Promise<StatementResult> {
    if (statementIsAn("update", statement)) {
        return apply(() => updateDatabase(databaseName, statement), "update");
    } else if (statementIsA("delete", statement)) {
        return apply(
            () => deleteDatabaseRows(databaseName, statement),
            "delete"
        );
    } else if (statementIsAn("insert", statement)) {
        return apply(
            () => insertDatabaseRows(databaseName, statement),
            "insert"
        );
    } else if (statementIsAn("select", statement)) {
        return apply(
            () => selectDatabaseRows(databaseName, statement),
            "select"
        );
    }
    return Promise.resolve({
        status: StatementResultStatus.FAILED,
        message: "Statement not supported",
        result: undefined,
    });
}

async function apply(
    func: () => Promise<undefined | SelectStatementResults>,
    action: string
) {
    return func()
        .then((result) => ({
            status: StatementResultStatus.SUCCESS,
            message: `${action.toUpperCase()} SUCCESSFUL!!!`,
            result,
        }))
        .catch(() => ({
            status: StatementResultStatus.FAILED,
            message: `${action.toUpperCase()} FAILED!!!`,
            result: undefined,
        }));
}

function statementIsAn(statementType: string, statement: string) {
    return statement.toLocaleLowerCase().startsWith(statementType);
}
const statementIsA = statementIsAn;
