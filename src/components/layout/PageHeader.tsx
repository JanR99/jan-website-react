import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
    title: ReactNode;
    eyebrow?: string;
    lead?: ReactNode;
    back?: { to: string; label: string };
    children?: ReactNode;
}

export default function PageHeader({ title, eyebrow, lead, back, children }: PageHeaderProps) {
    return (
        <div className="page-header">
            {back && (
                <Link to={back.to} className="back-link">
                    <ArrowLeft size={16} />
                    {back.label}
                </Link>
            )}
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h1>{title}</h1>
            {lead && <p className="page-header-lead">{lead}</p>}
            {children}
        </div>
    );
}
