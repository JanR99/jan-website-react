import { MONTH_NAMES } from "../../utils/travel";

/** What is filled in so far; the month as "01" to "12". Both empty for no month at all. */
export interface MonthInput {
    year: string;
    month: string;
}

/** A month like "2024-05" (or none) split into the two parts of the field. */
export function monthInput(value: string | null): MonthInput {
    const [year = "", month = ""] = (value ?? "").split("-");
    return { year, month };
}

interface TravelMonthFieldProps {
    /** "Von" or "Bis" */
    label: string;
    value: MonthInput;
    onChange: (value: MonthInput) => void;
}

/**
 * Chooses a month and a year. Not an <input type="month">, because Firefox and Safari on the desktop
 * only show a plain text field for it.
 */
export default function TravelMonthField({ label, value, onChange }: TravelMonthFieldProps) {
    return (
        <div className="travel-month-field">
            <span>{label}</span>
            <select
                className="input"
                value={value.month}
                onChange={(e) => onChange({ ...value, month: e.target.value })}
                aria-label={`${label}: Monat`}
            >
                <option value="">Monat</option>
                {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={String(i + 1).padStart(2, "0")}>{name}</option>
                ))}
            </select>
            <input
                className="input"
                value={value.year}
                onChange={(e) => onChange({ ...value, year: e.target.value.replace(/\D/g, "") })}
                inputMode="numeric"
                maxLength={4}
                placeholder="Jahr"
                aria-label={`${label}: Jahr`}
            />
        </div>
    );
}
