import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";

function AlumnusItem(alumnus, textFilter, statusFilter, itemFunction) {
    let fullname = alumnus.surname + " " + alumnus.name
    let visible = textFilter ? (fullname + " " + alumnus.coorte).toLowerCase().includes(textFilter.toLowerCase()) : true
    visible *= ( statusFilter.length == 0 || statusFilter.includes( alumnus.status ) );

    return (
        <div key={alumnus.id}  style={ disappearing( visible ) } >
            { itemFunction( alumnus ) }
        </div>
    )
}

export default function ListTemplate({ data, itemFunction }) {

    // Extract coorts
    const coorts = data.map(alumnus => alumnus.coorte).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);

    // Extract status
    const status = data.map(alumnus => alumnus.status).filter((v, i, a) => a.indexOf(v) === i).sort();

    const orders = { alphabetical: 1, coorte: 2 }
    const [order, setOrder] = useState(orders.coorte)
    const [textFilter, setTextFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState([])

    const updateStatusFilter = ( s ) => {
        let index = statusFilter.indexOf( s );
        if( index > -1 ) {
            statusFilter.splice( index, 1 );
        }
        else {
            statusFilter.push( s );
        }
        setStatusFilter( [...statusFilter] );
    }
    
    return (
        <>
            <div className="w-full relative mb-4">
                <input type="text" className="w-full text-center" placeholder="Filtra..." value={textFilter} onChange={(e) => setTextFilter(e.target.value)} />
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
            <div className="w-full mt-4 flex flex-row justify-center flex-wrap">
                { status.map( s =>
                    <div className="chip px-2 py-1 cursor-pointer" key={s}
                        style={{ opacity: ( ( statusFilter.length == 0 || statusFilter.includes( s ) ) ? 1 : 0.4 ), ...bgAndContrast( AlumnusStatus.colors[ s ] ) }}
                        onClick={ () => updateStatusFilter( s )}>
                        { AlumnusStatus.names[ s ] }
                    </div> )}
            </div>
            <div className="w-full md:w-2/5 flex flex-col items-stretch mt-4" style={order == orders.alphabetical ? {} : { display: "none" }} >
                {data.map(alumnus => AlumnusItem(alumnus, textFilter, statusFilter, itemFunction))}
            </div>
            <div className="w-full flex flex-row justify-start mt-4 flex-nowrap overflow-x-auto whitespace-nowrap" style={order == orders.coorte ? {} : { display: "none" }} >
                {coorts.map(coort =>
                    <div className="w-4/5 md:w-2/5 grow-0 shrink-0" key={coort}>
                        <span className="bg-gray-200 border-gray-400 border flex flex-row p-2">
                            <span key={0} className="font-bold">{romanize(coort)} Coorte</span>
                        </span>
                        {data.map(alumnus => alumnus.coorte == coort ? AlumnusItem(alumnus, textFilter, statusFilter, itemFunction) : '')}
                    </div>
                )}
            </div>
        </>
    );
}