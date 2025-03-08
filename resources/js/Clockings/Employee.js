import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
// import Clock from "react-live-clock";
import Backdrop from "../Layout/Backdrop";
import { postRequest } from "../Utils";
import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { useStopwatch, useTime } from "react-timer-hook";

function twoDigits(num) {
    return ("" + num).padStart(2, '0');
}

function Clock() {
    const {
        seconds,
        minutes,
        hours,
    } = useTime();

    return <>{twoDigits(hours)}:{twoDigits(minutes)}:{twoDigits(seconds)}</>
}

function Stopwatch({ from }) {
    const offsetTimestamp = new Date();
    offsetTimestamp.setSeconds(offsetTimestamp.getSeconds() + (offsetTimestamp - from) / 1000);
    const {
        seconds,
        minutes,
        hours,
    } = useStopwatch({ autoStart: true, offsetTimestamp: offsetTimestamp });

    if (hours > 0)
        return <>{twoDigits(hours)}:{twoDigits(minutes)}:{twoDigits(seconds)}</>
    return <>{twoDigits(minutes)}:{twoDigits(seconds)}</>
}

export default function Employee() {

    const [processing, setProcessing] = useState(false);

    const lastClockIn = usePage().props.clockedIn;
    const user = usePage().props.user;

    const submit = (to) => {
        postRequest(
            'clockings.' + to, {},
            setProcessing
        )
    }

    return <div className="main-container gap-4">
        <h3>Timbrature dipendenti - <i>{user.identity ? (user.identity.name || '') + " " + (user.identity.surname || '') : user.credential}</i></h3>
        <span className="text-6xl md:text-9xl font-mono"><Clock /></span>
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
        <Backdrop open={processing} />
    </div>
}