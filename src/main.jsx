import { registerSW } from "virtual:pwa-register";
import ReactDOM from "react-dom/client";
import { HashRouter as BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.jsx";
import { store } from "./store/store.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </Provider>,
);

if ("serviceWorker" in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (window.confirm("Update available. Reload BookNest?")) updateSW(true);
    },
    onOfflineReady() {
      console.info("BookNest app files ready for offline use.");
    },
    onRegisterError(error) {
      console.error("Service worker registration failed", error);
    },
  });
}
