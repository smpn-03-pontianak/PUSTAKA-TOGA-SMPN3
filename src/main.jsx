import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || String(error) };
  }
  componentDidCatch(error) {
    console.error("Runtime Error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "sans-serif", textAlign: "center" }}>
          <h2>Memuat Ulang Halaman Pustaka TOGA...</h2>
          <p style={{ color: "#666", fontSize: 13 }}>{this.state.message}</p>
          <button
            onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.reload(); }}
            style={{ marginTop: 12, padding: "10px 18px", borderRadius: 10, border: "none", background: "#7C4700", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
          >
            Muat Ulang Sekarang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
