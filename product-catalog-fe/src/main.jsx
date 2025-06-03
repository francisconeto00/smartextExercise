import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; 
import { createTheme, MantineProvider } from '@mantine/core';
import App from "./App.jsx";
import "./index.css";
import "@mantine/core/styles.css"; 

const theme = createTheme({
  /** Put your mantine theme override here */
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter> 
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <App />
    </MantineProvider>
    </BrowserRouter>
  </StrictMode>
);
