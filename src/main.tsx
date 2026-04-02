import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { setupIonicReact } from "@ionic/react";

import "@ionic/react/css/core.css";
import "./theme/variables.css";

setupIonicReact();

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);