import {
    AppBar,
    makeStyles,
    Theme,
    Toolbar,
    Typography,
} from "@material-ui/core";
import React from "react";
import { Outlet } from "react-router-dom";

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        height: `calc(100vh - ${theme.mixins.toolbar.height}px)`,
        width: "100vw",
        padding: theme.spacing(2),
        boxSizing: "border-box",
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
}));

export function AppContainer() {
    const classes = useStyle();

    return (
        <>
            <AppBar position="static" color="inherit" elevation={0}>
                <Toolbar className={classes.toolbar}>
                    <Typography variant="h3" color="textSecondary">
                        Access-it
                    </Typography>
                </Toolbar>
            </AppBar>
            <div className={classes.root}>
                <Outlet />
            </div>
        </>
    );
}
