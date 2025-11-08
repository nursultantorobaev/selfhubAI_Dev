import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "./lib/sentry";
import { initAnalytics } from "./lib/analytics";

// Initialize error tracking (Sentry)
initSentry();

// Initialize analytics (Google Analytics)
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (gaMeasurementId) {
  initAnalytics(gaMeasurementId);
}

createRoot(document.getElementById("root")!).render(<App />);
