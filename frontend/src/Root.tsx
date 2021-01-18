import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import React from "react";
import { App } from "./App";

const theme = createMuiTheme({
    palette: {
        primary: {
            dark: "#1c7fac",
            main: "#29b6f6",
            light: "#53c4f7",
        },
        secondary: {
            dark: "#a147af",
            main: "#e666fb",
            light: "#eb84fb",
        },
    },
});

export function Root() {
    return (
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    );
}
