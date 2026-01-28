
export function getStatusColor(value) {
    switch (value) {
        case 'open': return 1;
        case 'closed': return 3;
        case 'retired': return 0;
        case 'accepted': return 4;
        case 'refused': return 2;
        case 'solved': return 0;
        default: return 9;
    }
}

export function getStatusLabel(value) {
    switch (value) {
        case 'open': return 'Aperto';
        case 'closed': return 'Chiuso';
        case 'retired': return 'Ritirato';
        case 'accepted': return 'Accettato';
        case 'refused': return 'Rifiutato';
        case 'solved': return 'Risolto';
        default: return value;
    }
}
