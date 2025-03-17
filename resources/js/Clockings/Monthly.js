import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Backdrop from "../Layout/Backdrop";
import { postRequest } from "../Utils";
import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { useStopwatch, useTime } from "react-timer-hook";

function twoDigits(num) {
    return ("" + num).padStart(2, '0');
}

// function Clock() {
//     const {
//         seconds,
//         minutes,
//         hours,
//     } = useTime();

//     return <>{twoDigits(hours)}:{twoDigits(minutes)}:{twoDigits(seconds)}</>
// }

// function Stopwatch({ from }) {
//     const offsetTimestamp = new Date();
//     offsetTimestamp.setSeconds(offsetTimestamp.getSeconds() + (offsetTimestamp - from) / 1000);
//     const {
//         seconds,
//         minutes,
//         hours,
//     } = useStopwatch({ autoStart: true, offsetTimestamp: offsetTimestamp });

//     if (hours > 0)
//         return <>{twoDigits(hours)}:{twoDigits(minutes)}:{twoDigits(seconds)}</>
//     return <>{twoDigits(minutes)}:{twoDigits(seconds)}</>
// }

function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}

function totalCount (d) {
    console.log( d )
    if( d == undefined ) return '';
    return d.reduce((acc, val) => acc + val['hours'], 0);
}

function Table({daysCount,dateString}) {
    const data = usePage().props.data

    console.log( data )

    return <div className="grid w-full" style={{'gridTemplateColumns': 'minmax(auto, 10fr) repeat(31, minmax(0, 1fr))'}}>
        {[...Array(32).keys()].map(i =>
            <div key={i} className="font-bold">{ ( i > 0 && i <= daysCount ) ? i : ''}</div>)}
        {data.map(d => <>
            <div key={d.id + "-0"}>{d.name} {d.surname}</div>
            {[...Array(31).keys()].map(i => <div key={d.id + "-" + i}>
                { totalCount( d.stamps_grouped[ i+1 ] ) }
            </div>)}
        </>)}
    </div>

}

export default function Monthly() {

    const year = usePage().props.year;
    const month = usePage().props.month;

    const today = new Date();
    const nextAvailable = ( year < today.getFullYear() ) || ( year == today.getFullYear() && month < today.getMonth() + 1 );
    const date = new Date(year,month-1, 3);

    const [processing, setProcessing] = useState(false);

    const lastClockIn = usePage().props.clockedIn;
    const user = usePage().props.user;

    const submit = (to) => {
        postRequest(
            'clockings.' + to, {},
            setProcessing
        )
    }

    function capFirst(val) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }    

    return <div className="main-container-large gap-4">
        <h3>Registro timbrature</h3>
        <div className="flex flex-row gap-2 items-center">
            <Link as="button" className="button" href={route('clockings.monthly', month == 1 ? { year: year - 1, month: 12 } : { year: year, month: month - 1 } )}>
                <FontAwesomeIcon icon={solid('chevron-left')} />
            </Link>
            <h3>{ capFirst( date.toLocaleDateString('it-IT',{ 'month': 'long', 'year': 'numeric' }) )}</h3>
            <Link as="button" className="button" href={route('clockings.monthly', month == 12 ? { year: year + 1, month: 1 } : { year: year, month: month + 1 } )} disabled={!nextAvailable}>
                <FontAwesomeIcon icon={solid('chevron-right')} />
            </Link>
        </div>
        <Table daysCount={ daysInMonth(month, year) } dateString={"" + year + "-" + twoDigits(month) + "-"} />
        {/* <span className="text-6xl md:text-9xl font-mono"><Clock /></span>
        {lastClockIn && <div>
            Entrato ore: {new Date(lastClockIn.clockin).toLocaleTimeString('it-IT', { 'hour': '2-digit', 'minute': '2-digit' })} - Dall'entrata <Stopwatch from={new Date(lastClockIn.clockin)} />
        </div>}
        <div className="grid grid-cols-2 content-center items-stretch gap-4">
            <button className="button flex flex-col text-xl md:text-4xl font-bold aspect-square items-center justify-center gap-4" onClick={() => submit('clockin')} disabled={lastClockIn}>
                <FontAwesomeIcon icon={solid('right-to-bracket')} className="text-5xl" />
                Entrata
            </button>
            <button className="button flex flex-col text-xl md:text-4xl font-bold aspect-square items-center justify-center gap-4" onClick={() => submit('clockout')} disabled={!lastClockIn}>
                <FontAwesomeIcon icon={solid('right-from-bracket')} className="text-5xl" />
                Uscita
            </button>
        </div>
        <Link className="button flex flex-row font-bold items-center justify-center" >
            <FontAwesomeIcon icon={solid('rectangle-list')} className="text-xl" href={route('clockings.monthly')} />
            Conteggi orari
        </Link>
        <Backdrop open={processing} /> */}
    </div>
}