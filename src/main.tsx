import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { MapProvider } from "./contexts/mapContext.tsx";

const theme = createTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <MapProvider>
        <CssBaseline />
        <App />
      </MapProvider>
    </ThemeProvider>
  </StrictMode>
);
