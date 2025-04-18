
export function getStatusColor(value) {
    switch (value) {
        case 'open': return 4;
        case 'closed': return 2;
        case 'solved': return 0;
        default: return 9;
    }
}

export function getStatusLabel(value) {
    switch (value) {
        case 'open': return 'Aperto';
        case 'closed': return 'Chiuso';
        case 'solved': return 'Risolto';
        default: return value;
    }
}
