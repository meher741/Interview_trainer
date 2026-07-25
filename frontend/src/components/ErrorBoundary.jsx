import { Component } from "react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="page-card fade-in-up" style={{ marginTop: 20 }}>
                    <div className="empty-state">
                        <div className="empty-icon">⚠️</div>
                        <h2>Something went wrong</h2>
                        <p style={{ color: "var(--text-light)", fontSize: 14 }}>
                            An unexpected error occurred while loading this page.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 8 }}
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                        >
                            🔄 Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

