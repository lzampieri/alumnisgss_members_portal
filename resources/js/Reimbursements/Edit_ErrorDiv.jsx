



function getKeyText_Expenses(key, value) {
    let value_t = Array.isArray(value) ? value.join(", ") : value;
    if (key == "title") return "Materiale: " + value_t;
    if (key == "place") return "Luogo di acquisto: " + value_t;
    if (key == "date") return "Data: " + value_t;
    if (key == "price") return "Prezzo: " + value_t;
    if (key == "files") return "Ricevute: " + value_t;
    if (key == "way") return "Mezzo di trasporto: " + value_t;
    if (key == "from") return "Partenza: " + value_t;
    if (key == "from.id") return "Partenza: " + value_t;
    if (key == "from.name") return "Partenza: " + value_t;
    if (key == "to") return "Arrivo: " + value_t;
    if (key == "to.id") return "Arrivo: " + value_t;
    if (key == "to.name") return "Arrivo: " + value_t;
    if (key == "Distance") return value_t;
}

export function ExpensesErrorDiv({ errors }) {
    if (!errors || Object.keys(errors).length == 0) return null;

    return <div className="alert">
        {Object.keys(errors).map(k =>
            <p key={k}>{getKeyText_Expenses(k, errors[k])}</p>
        )}
    </div>
}