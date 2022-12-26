import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/inertia-react";
import { useEffect, useState } from "react";
import { AlumnusStatus, romanize } from "../Utils";

function AlumnusLink(alumnus, filter) {
    let fullname = alumnus.surname + " " + alumnus.name
    let visible = filter ? (fullname + " " + alumnus.coorte).includes(filter) : true

    return (
        <div key={alumnus.id} className="overflow-hidden" style={{ height: visible ? 'auto' : 0 }} >
            <div className="mylist-item flex flex-row p-2">
                <span style={{ color: AlumnusStatus.colors[alumnus.status] }} className="pr-2 group relative">
                    ⬤
                    <span className="tooltip-right">
                        {AlumnusStatus.names[alumnus.status]}
                    </span>
                </span>
                {alumnus.surname} {alumnus.name}
                <div className="chip">{romanize(alumnus.coorte)}</div>
                <div className="grow"></div>
                <Link className="icon-button" href={route('registry.edit', { alumnus: alumnus.id })}><FontAwesomeIcon icon={solid('pen')} /></Link>
            </div>
        </div>
    )
}

export default function List() {
    const alumni = usePage().props.alumni

    // Extract coorts
    const coorts = alumni.map(alumnus => alumnus.coorte).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);

    const orders = { alphabetical: 1, coorte: 2 }
    const [order, setOrder] = useState(orders.coorte)
    const [filter, setFilter] = useState("")

    return (
        <div className="main-container">
            <div className="w-full flex flex-row justify-end">
                <Link className="button" href={route('registry.add')}>
                    <FontAwesomeIcon icon={solid('circle-plus')} />
                    Aggiungi
                </Link>
                {usePage().props.canImport &&
                    <Link className="button" href={route('registry.bulk')}>
                        <FontAwesomeIcon icon={solid('folder-plus')} />
                        Importa
                    </Link>
                }
            </div>
            <div className="w-full relative mb-4">
                <input type="text" className="w-full text-center" placeholder="Filtra..." value={filter} onChange={(e) => setFilter(e.target.value)} />
                <FontAwesomeIcon icon={solid('magnifying-glass')} className="input-icon" />
            </div>
            <div className="w-full flex flex-row justify-center">
                <button
                    onClick={() => setOrder(orders.alphabetical)}
                    className={order == orders.alphabetical ? "button button-active" : "button"}
                >Ordine alfabetico</button>
                <button
                    onClick={() => setOrder(orders.coorte)}
                    className={order == orders.coorte ? "button button-active" : "button"}
                >Per coorte</button>
            </div>
            <div className="w-full md:w-2/5 flex flex-col items-stretch mt-4" style={order == orders.alphabetical ? {} : { display: "none" }} >
                {alumni.map(alumnus => AlumnusLink(alumnus, filter))}
            </div>
            <div className="w-full flex flex-row justify-start mt-4 flex-nowrap overflow-x-auto whitespace-nowrap" style={order == orders.coorte ? {} : { display: "none" }} >
                {coorts.map(coort =>
                    <div className="w-4/5 md:w-2/5 grow-0 shrink-0">
                        <span className="bg-gray-200 border-gray-400 border flex flex-row p-2">
                            <span key={0} className="font-bold">{romanize(coort)} Coorte</span>
                        </span>
                        {alumni.map(alumnus => alumnus.coorte == coort ? AlumnusLink(alumnus, filter) : '')}
                    </div>
                )}
            </div>
        </div>
    );
}