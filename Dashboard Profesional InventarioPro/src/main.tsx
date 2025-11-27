import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GlobalFilterProvider } from "./lib/filters";

createRoot(document.getElementById("root")!).render(
  <GlobalFilterProvider>
    <App />
  </GlobalFilterProvider>
);
