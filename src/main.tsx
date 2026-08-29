import { createRoot } from "react-dom/client";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("root element missing");

const loadError = "Não foi possível carregar os dados da calculadora.";

void import("./pages/Index.tsx")
  .then(({ default: Index }) => {
    createRoot(root).render(<Index />);
  })
  .catch(() => {
    createRoot(root).render(<p>{loadError}</p>);
  });
