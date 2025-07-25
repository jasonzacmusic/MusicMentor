import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the default browser behavior
});

createRoot(document.getElementById("root")!).render(<App />);
