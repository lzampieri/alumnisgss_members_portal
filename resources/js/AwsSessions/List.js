import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1); 
}
function formatDay(date) {
    return capitalizeFirstLetter(new Date(date).toLocaleDateString('it-IT', { 'weekday': 'long', 'day': '2-digit', 'month': 'long', 'year': 'numeric' } ))
}
function formatTime(time) {
    return new Date(time).toLocaleTimeString('it-IT', { 'hour': '2-digit', 'minute': '2-digit' } )
}

function SessionLine(session) {
    if( session.endtime )
        return <div className="my-1" key={session.id}>
            <FontAwesomeIcon icon={solid('business-time')} className="mr-2" />
            Dalle { formatTime( session.starttime ) } alle { formatTime( session.endtime ) }
            <b> ({session.duration} minuti)</b>
        </div>
    return <div className="my-1" key={session.id}>
        <FontAwesomeIcon icon={solid('business-time')} className="mr-2 text-primary-main" />
        Dalle { formatTime( session.starttime ) }
        <b> (in corso)</b>
    </div>
}

function SessionsItem(date,sessions) {
    let total = 0;
    sessions.forEach( e => total = total + e.duration );
    total = total / 60;

    const [open, setOpen] = useState( false );

    return <div key={formatDay( date )}>
        <div className="mylist-item flex flex-col md:flex-row p-2 items-center gap-2">
            <div className="w-full md:w-1/2">{ formatDay( date ) }</div>
            <div className="w-full md:w-1/3">{ total.toFixed(1) } ore</div>
            <div className="w-full md:w-1/6 flex flex-row justify-center md:justify-end">
                <div className="icon-button aspect-square" onClick={() => setOpen(!open)}>
                    { open ?
                        <FontAwesomeIcon icon={solid('chevron-up')} /> :
                        <FontAwesomeIcon icon={solid('chevron-down')} />
                        }
                </div>
            </div>
        </div>
        <div className={
            "grid overflow-hidden transition-all duration-300 ease-in-out " + ( open ? "grid-rows-[1fr] " : "grid-rows-[0fr] ")
            + " ml-3"
            }>
            <div className="overflow-hidden">
                <div className="mb-3 px-2 border-l-4 border-l-primary-main flex flex-col">
                    { sessions.map( s => SessionLine( s ) ) }
                </div>
            </div>
        </div>
    </div>
}

export default function List() {
    const sessions = usePage().props.sessions
    // const canEdit = usePage().props.canEdit

    return (
        <div className="main-container">
            <span className="text-sm">{usePage().props.count} sessioni registrate.</span>
            <div className="w-full flex flex-col items-stretch mt-4">
                { Object.keys(sessions).map( k => SessionsItem(k,sessions[k]) ) }
            </div>
        </div>
    );
}