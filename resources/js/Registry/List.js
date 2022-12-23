import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/inertia-react";
import { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { AlumnusStatus, romanize } from "../Utils";

function AlumnusLink( alumnus, filter ) {
    let fullname = alumnus.surname + " " + alumnus.name
    let visible = filter ? (fullname + " " + alumnus.coorte).includes( filter ) : true

    const [ref, bounds] = useMeasure()
    const [openHeight,setOpenHeight] = useState('auto')
    useEffect( () => setOpenHeight( bounds.height == 0 ? 'auto' : bounds.height ), [ bounds ] )

    return (
        <div className="transition-[height] overflow-hidden"  key={ alumnus.id } style={{ height: visible ? openHeight : 0 }} >
            <div ref={ref} className="bg-gray-200 border-gray-400 border flex flex-row p-2">
                <span style={{ color: AlumnusStatus.colors[ alumnus.status ] }} className="pr-2 group relative">
                    ⬤
                    <span className="absolute z-10 px-2 bg-gray-200 invisible group-hover:visible whitespace-nowrap">
                        { AlumnusStatus.names[ alumnus.status ] }
                    </span>
                </span>
                { alumnus.surname } { alumnus.name }
                <div className="bg-gray-600 text-white rounded-3xl mx-2 px-2">{ romanize( alumnus.coorte ) }</div>
                <div className="grow"></div>
                <Link className="icon-button" href={ route('registry.edit', { alumnus: alumnus.id } ) }><FontAwesomeIcon icon={ solid('pen') } /></Link>
            </div>
        </div>
    )
}

export default function List() {
    const alumni = usePage().props.alumni

    // Extract coorts
    const coorts = alumni.map( alumnus => alumnus.coorte ).filter((v, i, a) => a.indexOf(v) === i).sort();

    const orders = { alphabetical: 1, coorte: 2 }
    const [order, setOrder] = useState( orders.coorte )
    const [filter, setFilter] = useState( "" )

    return (
        <div className="flex flex-col items-center w-full md:w-3/5">
            <div className="w-full flex flex-row justify-end">
                <Link className="button" href={ route('registry.add') }>
                    <FontAwesomeIcon icon={ solid('circle-plus') } />
                    Aggiungi
                </Link>
            </div>
            <div className="w-full relative mb-4">
                <input type="text" className="w-full text-center" placeholder="Filtra..." value={filter} onChange={ (e) => setFilter( e.target.value ) } />
                <FontAwesomeIcon icon={ solid('magnifying-glass')} className="
                        text-gray-500
                        absolute right-4 text-2xl inset-y-0 my-auto" />
            </div>
            <div className="w-full flex flex-row justify-center">
                <button
                    onClick={() => setOrder( orders.alphabetical )}
                    className={ order == orders.alphabetical ? "button button-active" : "button"}
                    >Ordine alfabetico</button>
                <button
                    onClick={() => setOrder( orders.coorte )}
                    className={ order == orders.coorte ? "button button-active" : "button"}
                    >Per coorte</button>
            </div>
            <div className="w-full md:w-2/5 flex flex-col items-stretch mt-4" style={ order == orders.alphabetical ? {} : { display : "none" }} >
                { alumni.map( alumnus => AlumnusLink( alumnus, filter ) ) }
            </div>
            <div className="w-full flex flex-row justify-start mt-4 flex-nowrap overflow-x-auto whitespace-nowrap" style={ order == orders.coorte ? {} : { display : "none" }} >
                { coorts.map( coort => 
                    <div className="w-4/5 md:w-2/5 grow-0 shrink-0">
                        <span className="bg-gray-200 border-gray-400 border flex flex-row p-2">
                            <span key={0} className="font-bold">{ romanize( coort ) } Coorte</span>
                        </span>
                        { alumni.map( alumnus => alumnus.coorte == coort ? AlumnusLink( alumnus, filter ) : '' ) }
                    </div>
                )}
            </div>
        </div>
    );
}