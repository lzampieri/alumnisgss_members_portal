import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { AlumnusStatus, bgAndContrast, disappearing, romanize } from "../Utils";
import ReactSwitch from "react-switch";

// TODO DELETE THIS SHIT

function AlumnusItem(alumnus, textFilter, statusFilter, itemFunction, showTags, tagsDict) {
    let fullname = alumnus.surname + " " + alumnus.name
    let visible = textFilter ? (fullname + " " + alumnus.coorte).toLowerCase().includes(textFilter.toLowerCase()) : true
    visible *= ( statusFilter.length == 0 || statusFilter.includes( alumnus.status ) );

    return (
        <div key={alumnus.id}  style={ disappearing( visible ) } >
            { itemFunction( alumnus, showTags, tagsDict ) }
        </div>
    )
}

export default function ListTemplate({ data, itemFunction, tagsDict = {} }) {

    // Extract coorts
    const coorts = data.map(alumnus => alumnus.coorte).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);

    // Extract status
    const status = data.map(alumnus => alumnus.status).filter((v, i, a) => a.indexOf(v) === i).sort();

    const orders = { alphabetical: 1, coorte: 2 }
    const [order, setOrder] = useState(orders.coorte)
    const [textFilter, setTextFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState([])

    // Tags
    let tags = Object.keys(tagsDict).length > 0;
    const [ showTags, setShowTags ] = useState( tags );

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
            <div className="w-full mt-4 flex flex-row justify-center flex-wrap"> { /* Status */ }
                { status.map( s =>
                    <div className="chip px-2 py-1 cursor-pointer" key={s}
                        style={{ opacity: ( ( statusFilter.length == 0 || statusFilter.includes( s ) ) ? 1 : 0.4 ), ...bgAndContrast( AlumnusStatus.status[ s ].color ) }}
                        onClick={ () => updateStatusFilter( s )}>
                        { AlumnusStatus.status[ s ].label }
                    </div> )}
            </div>
            { tags && <div className="w-full mt-2 flex flex-row justify-center items-center text-sm"> { /* Tags */ }
                <ReactSwitch height={14} width={28} className="text-xm mx-1" checked={showTags} onChange={ () => setShowTags( !showTags )} /> Mostra tags
            </div> }
            { tags && showTags && <div className="w-full flex flex-row justify-center flex-wrap"> { /* Tags */ }
                { Object.entries(tagsDict).map( ([v,k]) =>
                    <div className="chip px-2 py-1" key={k}
                        style={bgAndContrast('#1f77b4')}>
                        { k }: {v}
                    </div> ) }
            </div> }
            <div className="w-full md:w-2/5 flex flex-col items-stretch mt-4" style={order == orders.alphabetical ? {} : { display: "none" }} >
                {data.map(alumnus => AlumnusItem(alumnus, textFilter, statusFilter, itemFunction, showTags, tagsDict))}
            </div>
            <div className="w-full flex flex-row justify-start mt-4 flex-nowrap overflow-x-auto whitespace-nowrap" style={order == orders.coorte ? {} : { display: "none" }} >
                {coorts.map(coort =>
                    <div className="w-4/5 md:w-2/5 grow-0 shrink-0" key={coort}>
                        <span className="bg-gray-200 border-gray-400 border flex flex-row p-2">
                            <span key={0} className="font-bold">{ coort == 0 ? "Onorari" : romanize(coort) + " Coorte"}</span>
                        </span>
                        {data.map(alumnus => alumnus.coorte == coort ? AlumnusItem(alumnus, textFilter, statusFilter, itemFunction, showTags, tagsDict) : '')}
                    </div>
                )}
            </div>
        </>
    );
}