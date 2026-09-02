import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/registerServiceWorker";
import { initOutboxSync } from "./lib/offlineOutbox";

createRoot(document.getElementById("root")!).render(<App />);

// Offline caching (published app only) and replay of anything queued offline.
registerServiceWorker();
initOutboxSync();
