import { createRoot } from "react-dom/client";
import Index from "./pages/Index.tsx";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("root element missing");
createRoot(root).render(<Index />);
