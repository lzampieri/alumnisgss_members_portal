

import Backdrop from "../Layout/Backdrop";
import { postRequest } from "../Utils";
import { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { useStopwatch, useTime } from "react-timer-hook";
import EmptyDialog from "../Layout/EmptyDialog";
import { faBurger, faCakeCandles, faLaptopFile, faRectangleList, faRightFromBracket, faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

export default function Clocker() {

    const [processing, setProcessing] = useState(false);

    const canClockIn = usePage().props.canClockIn;

    const lastClockIn = usePage().props.lastClockIn;
    const canClockToday = usePage().props.canClockToday;

    const currentlyOnline = usePage().props.currentlyOnline;

    const [open, setOpen] = useState(false);

    const user = usePage().props.user;

    const submit = (to) => {
        postRequest(
            'clockings.' + to, {},
            setProcessing,
            {},
            false
        )
    }

    const checkTimes = () => {
        if ((!lastClockIn) || !canClockToday) return;

        if ((new Date(lastClockIn.clockin) < new Date(new Date().setHours(12, 0, 0, 0))) // Check that clocking before midday
            &&
            (new Date() > new Date(new Date().setHours(14, 0, 0, 0))) // Check that clockout after 14.00
        ) {
            setOpen(true);
            return;
        }
        submit('clockout')
    }

    return <div className="main-container gap-4">
        <Head title="Timbratore" />
        <h3>Timbrature dipendenti - <i>{user.identity ? (user.identity.name || '') + " " + (user.identity.surname || '') : user.credential}</i></h3>
        <span className="text-6xl md:text-9xl font-mono"><Clock /></span>
        {lastClockIn && canClockToday && <div>
            Entrato ore: {new Date(lastClockIn.clockin).toLocaleTimeString('it-IT', { 'hour': '2-digit', 'minute': '2-digit' })} - Dall'entrata <Stopwatch from={new Date(lastClockIn.clockin)} />
        </div>}
        {lastClockIn && !canClockToday && <div>
            Oggi sei in {lastClockIn.type.label}
        </div>}
        {canClockIn &&
            <div className="grid grid-cols-2 content-center items-stretch gap-4">
                <button className="button flex flex-col text-xl md:text-4xl font-bold aspect-square items-center justify-center gap-4" onClick={() => submit('clockin')} disabled={lastClockIn || !canClockToday}>
                    <FontAwesomeIcon icon={faRightToBracket} className="text-5xl" />
                    Entrata
                </button>
                <button className="button flex flex-col text-xl md:text-4xl font-bold aspect-square items-center justify-center gap-4" onClick={() => checkTimes()} disabled={(!lastClockIn) || !canClockToday}>
                    <FontAwesomeIcon icon={faRightFromBracket} className="text-5xl" />
                    Uscita
                </button>
                <EmptyDialog
                    open={open} onClose={() => setOpen(false)}>
                    {lastClockIn && canClockToday && <div className="text-center m-2">
                        <b>Anomalia rilevata!</b> Sei entrato alle {new Date(lastClockIn.clockin).toLocaleTimeString('it-IT', { 'hour': '2-digit', 'minute': '2-digit' })}, e sono le {new Date().toLocaleTimeString('it-IT', { 'hour': '2-digit', 'minute': '2-digit' })}. Hai fatto pausa pranzo nel mentre?
                    </div>}
                    <div className="grid grid-cols-2 content-center items-stretch gap-4 w-full">
                        <button className="button flex flex-col text-lg md:text-2xl font-bold items-center justify-center gap-4" onClick={() => submit('clockout_withlunch')} disabled={(!lastClockIn) || !canClockToday}>
                            <FontAwesomeIcon icon={faBurger} className="text-5xl" />
                            Pausa pranzo di 1 ora
                        </button>
                        <button className="button flex flex-col text-lg md:text-2xl font-bold items-center justify-center gap-4" onClick={() => submit('clockout')} disabled={(!lastClockIn) || !canClockToday}>
                            <FontAwesomeIcon icon={faLaptopFile} className="text-5xl" />
                            Nessuna pausa pranzo
                        </button>
                    </div>
                </EmptyDialog>
            </div>
        }
        {currentlyOnline &&
            <div className="flex flex-col w-full md:w-3/5">
                <div className="card text-center mb-1 font-bold">
                    Dipendenti in servizio al momento
                </div>
                {currentlyOnline.map(c =>
                    <div key={c.id}>
                        <FontAwesomeIcon icon={faUser} className="mr-2 text-primary-main" />
                        {c.employee.name} {c.employee.surname}: <b>{c.type.label}</b>
                    </div>
                )}
                {currentlyOnline.length == 0 && 'Nessun dipendente in servizio al momento'}
            </div>
        }
        <div className="flex flex-row gap-4">
            {canClockIn &&
                <Link className="button flex flex-col md:flex-row font-bold items-center justify-center" href={route('clockings.manageSpecials')} >
                    <FontAwesomeIcon icon={faCakeCandles} className="text-xl pr-2" />
                    Ferie e permessi
                </Link>}
            <Link className="button flex flex-row font-bold items-center justify-center" href={route('clockings.monthly')} >
                <FontAwesomeIcon icon={faRectangleList} className="text-xl pr-2" />
                Conteggi orari
            </Link>
        </div>
        <Backdrop open={processing} />
    </div>
}