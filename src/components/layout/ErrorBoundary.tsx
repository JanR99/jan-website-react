import { Component, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
    /** The error is forgotten when this changes, so another page gets a fresh try. */
    resetKey: string;
    children: ReactNode;
}

interface State {
    failed: boolean;
    resetKey: string;
}

/**
 * Catches errors while a page is shown (e.g. a file that can't be loaded), so the visitor gets
 * a way out instead of an empty page. React only offers this for class components.
 */
export default class ErrorBoundary extends Component<Props, State> {
    state: State = { failed: false, resetKey: this.props.resetKey };

    static getDerivedStateFromError(): Partial<State> {
        return { failed: true };
    }

    static getDerivedStateFromProps(props: Props, state: State): State | null {
        return props.resetKey === state.resetKey ? null : { failed: false, resetKey: props.resetKey };
    }

    render() {
        if (!this.state.failed) return this.props.children;

        return (
            <div className="container">
                <div className="card empty-state" style={{ marginTop: 48 }} role="alert">
                    <span className="empty-state-icon"><RefreshCw size={26} /></span>
                    <h3>Etwas ist schiefgelaufen</h3>
                    <p>Die Seite konnte nicht angezeigt werden. Lade sie neu, dann sollte es wieder gehen.</p>
                    <button type="button" className="btn" onClick={() => window.location.reload()}>
                        Neu laden
                    </button>
                </div>
            </div>
        );
    }
}
