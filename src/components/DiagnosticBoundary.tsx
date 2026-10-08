import React from "react";

interface State {
  error: Error | null;
  info: string;
}

/**
 * Error boundary — catches unexpected render crashes so the page never
 * goes blank white. Shows a friendly message with a reload button.
 */
export class DiagnosticBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null, info: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({
      info: (info.componentStack || "").split("\n").slice(0, 8).join("\n"),
    });
    try {
      (window as any).__lastError =
        error.message + "\n" + (error.stack || "").slice(0, 2000);
    } catch {
      /* noop */
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 48,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            color: "#44403c",
            background: "#fafaf9",
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 20 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, maxWidth: 420 }}>
            This page hit an unexpected error. Please reload — your work is
            safe.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px",
              borderRadius: 12,
              background: "#059669",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
