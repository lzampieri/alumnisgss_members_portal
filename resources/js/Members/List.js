import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/inertia-react";
import { useEffect, useState } from "react";
import { AlumnusStatus, romanize } from "../Utils";

function AlumnusItem(alumnus, filter) {
    let fullname = alumnus.surname + " " + alumnus.name
    let visible = filter ? (fullname + " " + alumnus.coorte).toLowerCase().includes(filter.toLowerCase()) : true

    return (
        <div key={alumnus.id} style={{ height: visible ? 'auto' : 0 }} >
            <div className="mylist-item flex flex-row p-2">
                {alumnus.surname} {alumnus.name}
                <div className="chip">{romanize(alumnus.coorte)}</div>
            </div>
        </div>
    )
}

export default function List() {
    const members = usePage().props.members

    // Extract coorts
    const coorts = members.map(alumnus => alumnus.coorte).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);

    const orders = { alphabetical: 1, coorte: 2 }
    const [order, setOrder] = useState(orders.coorte)
    const [filter, setFilter] = useState("")

    return (
        <div className="main-container">
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
                {members.map(alumnus => AlumnusItem(alumnus, filter))}
            </div>
            <div className="w-full flex flex-row justify-start mt-4 flex-nowrap overflow-x-auto whitespace-nowrap" style={order == orders.coorte ? {} : { display: "none" }} >
                {coorts.map(coort =>
                    <div className="w-4/5 md:w-2/5 grow-0 shrink-0" key={coort}>
                        <span className="bg-gray-200 border-gray-400 border flex flex-row p-2">
                            <span key={0} className="font-bold">{romanize(coort)} Coorte</span>
                        </span>
                        {members.map(alumnus => alumnus.coorte == coort ? AlumnusItem(alumnus, filter) : '')}
                    </div>
                )}
            </div>
        </div>
    );
}