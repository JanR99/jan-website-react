import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

interface DialogProps {
    open: boolean;
    onClose: () => void;
    labelledBy: string;
    className?: string;
    children: ReactNode;
}

export default function Dialog({ open, onClose, labelledBy, className = "", children }: DialogProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    useBodyScrollLock(open);

    useEffect(() => {
        if (!open) return;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);

        requestAnimationFrame(() => {
            panelRef.current?.querySelector<HTMLElement>("input, button:not(.dialog-close)")?.focus();
        });

        return () => {
            document.removeEventListener("keydown", onKey);
            previouslyFocused?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div
                ref={panelRef}
                className={`dialog ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
            >
                <button type="button" className="icon-btn dialog-close" onClick={onClose} aria-label="Schließen">
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
}
