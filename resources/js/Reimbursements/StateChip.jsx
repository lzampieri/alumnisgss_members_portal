import { bgAndContrastPastel } from "../Utils";

const states = {
    'draft': { label: 'Bozza', color: 9 },
    'sent': { label: 'Inviata', color: 1 },
    'approved': { label: 'Approvata', color: 0 },
    'paid': { label: 'Pagata', color: 4 },
}

export default function StateChip({ value }) {
    return <div className="flex flex-row align-center justify-start items-center h-full">
        <div className="px-1 rounded-xl leading-none p-2" style={bgAndContrastPastel(states[value]?.color)}>
            {states[value]?.label}
        </div>
    </div>
}