import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/registerServiceWorker";
import { initOutboxSync } from "./lib/offlineOutbox";
import { installFrameGovernor } from "./lib/frameGovernor";

// Cap animation frame rate to what this device can actually sustain, for every
// animated scene at once, before anything renders.
installFrameGovernor();

createRoot(document.getElementById("root")!).render(<App />);

// Offline caching (published app only) and replay of anything queued offline.
registerServiceWorker();
initOutboxSync();
