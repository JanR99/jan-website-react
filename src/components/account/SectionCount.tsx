import type { AccountSection } from "../../config/navigation";
import { useOpenFeedbackCount } from "../../hooks/useOpenFeedbackCount";

/** The number of open feedback next to the feedback area, in the account menu and the sidebar. */
export default function SectionCount({ section }: { section: AccountSection }) {
    const open = useOpenFeedbackCount();
    if (section.requires !== "MANAGE_FEEDBACK" || open === 0) return null;
    return <span className="nav-count" title={`${open} offen`}>{open}</span>;
}
