import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (!import.meta.env.PROD) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations.map((registration) => registration.unregister()),
          ),
        );
      return;
    }

    void navigator.serviceWorker.register("/sw.js").then((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) {
          return;
        }

        installing.addEventListener("statechange", () => {
          if (
            installing.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            registration.waiting?.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    });

    let hasRefreshed = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hasRefreshed) {
        return;
      }
      hasRefreshed = true;
      globalThis.location.reload();
    });
  });
}
