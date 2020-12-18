import { makeStyles } from "@material-ui/core";
import React from "react";
import { DatabasesContainer } from "./DatabasesContainer";

const useStyle = makeStyles(() => ({
    root: {
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
}));

export function App() {
    const classes = useStyle();

    return (
        <div className={classes.root}>
            <DatabasesContainer />
        </div>
    );
}
