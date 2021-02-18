import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DatabaseContainer } from "./databases/DatabaseContainer";
import { DatabasesContainer } from "./databases/DatabasesContainer";
import { DatabaseTableContainer } from "./databases/DatabaseTableContainer";
import { NewTableForm } from "./databases/NewTableForm";
import { AppContainer } from "./AppContainer";
import { DatabaseQueryPage } from "./databases/query/DatabaseQueryPage";

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to={"/databases"} />} />
                <Route path="/*" element={<AppContainer />}>
                    <Route path="/databases" element={<DatabasesContainer />}>
                        <Route
                            path="/:databaseName"
                            element={<DatabaseContainer />}
                        />
                    </Route>

                    <Route
                        path="/databases/:databaseName/query"
                        element={<DatabaseQueryPage />}
                    />
                    <Route
                        path="/databases/:databaseName/tables/:tableName"
                        element={<DatabaseTableContainer />}
                    />
                    <Route
                        path="/databases/:databaseName/new-table"
                        element={<NewTableForm />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
