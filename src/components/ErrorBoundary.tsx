import { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("ErrorBoundary caught a render error", error);
    logger.error("Component stack", errorInfo.componentStack);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 400, padding: 24 }}>
            <div
              style={{
                fontSize: 48,
                marginBottom: 16,
              }}
            >
              ⚠️
            </div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "hsl(var(--muted-foreground))",
                marginBottom: 24,
              }}
            >
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <button
              onClick={this.handleRefresh}
              style={{
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                backgroundColor: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
