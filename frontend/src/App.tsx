import { makeStyles, Theme } from "@material-ui/core";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DatabaseContainer } from "./databases/DatabaseContainer";
import { DatabasesContainer } from "./databases/DatabasesContainer";
import { DatabaseTableContainer } from "./databases/DatabaseTableContainer";
import { NewTableForm } from "./databases/NewTableForm";

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        height: "100vh",
        width: "100vw",
        padding: theme.spacing(2),
        boxSizing: "border-box",
    },
}));

export function App() {
    const classes = useStyle();

    return (
        <div className={classes.root}>
            <BrowserRouter>
                <Routes>
                    <Route path="/databases" element={<DatabasesContainer />}>
                        <Route
                            path="/:databaseName"
                            element={<DatabaseContainer />}
                        />
                    </Route>

                    <Route
                        path="/databases/:databaseName/tables/:tableName"
                        element={<DatabaseTableContainer />}
                    />
                    <Route
                        path="/databases/:databaseName/new-table"
                        element={<NewTableForm />}
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}
