import { useEffect, useSyncExternalStore } from "react";
import { useAuth } from "../components/auth/AuthContext";
import FeedbackController from "../controller/FeedbackController";

let count = 0;
let owner: number | null = null;
const listeners = new Set<() => void>();

function emit(next: number) {
    count = next;
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** Loaded once per user who may manage feedback; the feedback area keeps it up to date. */
function loadFor(userId: number | null) {
    if (owner === userId) return;
    owner = userId;
    emit(0);
    if (userId === null) return;

    FeedbackController.openCount()
        .then((open) => {
            if (owner === userId) emit(open);
        })
        .catch(() => {
            // no number then; the next component that mounts tries again
            if (owner === userId) owner = null;
        });
}

/** The feedback area knows the real number after every change, without asking the backend again. */
export function setOpenFeedbackCount(open: number) {
    if (owner !== null) emit(open);
}

/** How much feedback is not marked as done yet; 0 for anyone who may not manage feedback. */
export function useOpenFeedbackCount(): number {
    const { user, hasPermission } = useAuth();
    const userId = user && hasPermission("MANAGE_FEEDBACK") ? user.id : null;

    useEffect(() => {
        loadFor(userId);
    }, [userId]);

    return useSyncExternalStore(subscribe, () => (userId !== null && owner === userId ? count : 0));
}
