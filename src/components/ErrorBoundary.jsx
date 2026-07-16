import { Component } from "react";
import { AlertIcon, RefreshIcon } from "./Icons.jsx";

// Catches render/runtime errors in the subtree so a single bad component can
// never blank the whole app. Pass `compact` for an inline fallback (e.g. inside
// a table row); omit it for the full-page fallback.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface it for debugging without taking the UI down.
    console.error("UI error caught by ErrorBoundary:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.compact) {
      return (
        <div className="alert alert-error small" style={{ margin: 12 }}>
          <AlertIcon size={16} />
          <span>
            Could not render this section.
            <button
              className="btn btn-ghost btn-tiny"
              style={{ marginLeft: 8 }}
              onClick={this.reset}
            >
              Retry
            </button>
          </span>
        </div>
      );
    }

    return (
      <div className="center-screen">
        <div className="login-wrap">
          <div className="login-card" style={{ textAlign: "center" }}>
            <span
              className="login-badge"
              style={{ background: "linear-gradient(150deg,#f87171,#dc2626)" }}
            >
              <AlertIcon size={22} />
            </span>
            <h1 className="login-title">Something went wrong</h1>
            <p className="login-subtitle">
              The page hit an unexpected error. Reloading usually fixes it.
            </p>
            <button
              className="btn btn-primary btn-block"
              onClick={() => window.location.reload()}
            >
              <RefreshIcon size={16} /> Reload dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}
