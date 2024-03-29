import { createTheme, ThemeProvider } from "@material-ui/core";
import { App } from "./App";

const theme = createTheme({
    palette: {
        type: "dark",
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
    mixins: { toolbar: { height: 64 } },
});

export function Root() {
    return (
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    );
}
