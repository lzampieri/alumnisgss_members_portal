import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Datepicker from "tailwind-datepicker-react"
import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { AlumnusStatus } from "../Utils";

function YearPicker({ year, setYear }) {
    return (
        <div className="flex flex-row items-center">
            <FontAwesomeIcon icon={solid('chevron-left')} className="w-full discrete-button" onClick={() => setYear(year - 1)} />
            <div className="text-xl font-bold px-2">{year}</div>
            <FontAwesomeIcon icon={solid('chevron-right')} className="w-full discrete-button" onClick={() => setYear(year + 1)} />
        </div>
    )
}

function SelectByYear({ sendPostRequest }) {
    const [from, setFrom] = useState(new Date().getFullYear());
    const [to, setTo] = useState(new Date().getFullYear());

    const updateFrom = (newYear) => {
        setFrom(newYear)
        if (to < newYear) setTo(newYear)
    }
    const updateTo = (newYear) => {
        setTo(newYear)
        if (from > newYear) setFrom(newYear)
    }
    const send = () => {
        sendPostRequest(
            new Date(from, 0),
            new Date(new Date(to + 1, 0) - 1)
        )
    }

    return <>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <YearPicker year={from} setYear={(newYear) => updateFrom(newYear)} />
            <FontAwesomeIcon icon={solid('arrows-left-right-to-line')} className="block rotate-90 md:hidden" />
            <FontAwesomeIcon icon={solid('arrows-left-right-to-line')} className="hidden md:block" />
            <YearPicker year={to} setYear={(newYear) => updateTo(newYear)} />
        </div>
        <div className="button w-fit" onClick={send}>Genera</div>
    </>
}

function SelectByDate({ sendPostRequest }) {
    const [from, setFrom] = useState(new Date(new Date().getFullYear(), 0));
    const [to, setTo] = useState(new Date(new Date(new Date().getFullYear() + 1, 0) - 1));

    const setToRealigner = (newDate) => {
        setTo(new Date(newDate - 1 + 24 * 60 * 60 * 1000))
    }

    const [datePickerOpenFrom, setDatePickerOpenFrom] = useState(false);
    const [datePickerOpenTo, setDatePickerOpenTo] = useState(false);

    return <>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <Datepicker classNames='w-full' options={{ defaultDate: from, language: 'it', theme: { input: '!text-black' } }} onChange={(date) => setFrom(date)} show={datePickerOpenFrom} setShow={setDatePickerOpenFrom} />
            <FontAwesomeIcon icon={solid('arrows-left-right-to-line')} className="block rotate-90 md:hidden" />
            <FontAwesomeIcon icon={solid('arrows-left-right-to-line')} className="hidden md:block" />
            <Datepicker classNames='w-full' options={{ defaultDate: to, language: 'it', theme: { input: '!text-black' } }} onChange={(date) => setToRealigner(date)} show={datePickerOpenTo} setShow={setDatePickerOpenTo} />
        </div>
        <div className="button w-fit" onClick={() => sendPostRequest(from, to)}>Genera</div>
    </>
}

export default function MembersVariations() {

    const av_statuses = usePage().props.av_statuses;
    const [statuses, setStatuses] = useState(av_statuses.slice());

    const changeStatus = (id) => {
        if (statuses.includes(id)) {
            statuses.splice(statuses.indexOf(id), 1)
            setStatuses(statuses.slice())
        } else
            setStatuses(statuses.concat([id]))
    }

    console.log( statuses )


    const sendPostRequest = (from, to) => {
        window.location = route('reports.members_variations.generate',
            {
                statuses: statuses.join('.'),
                from: from.getTime() - from.getTimezoneOffset() * 60000,
                to: to.getTime() - to.getTimezoneOffset() * 60000
            });
    }

    return (
        <div className="main-container">
            <h3>Variazioni nei libri societari</h3>
            Relativa agli stati:
            <div className="flex flex-row gap-6">
                {av_statuses.map(s => (
                    <span key={s}>
                        <input type="checkbox" checked={statuses.includes(s)} autoComplete="off" onChange={() => changeStatus(s)} className="accent-primary-main" />
                        {AlumnusStatus.status[s].label}
                    </span>
                ))}

            </div>
            <div className="sheets-container">
                <div className="sheet-title">Per anno</div>
                <div className="sheet flex flex-col items-center gap-4"><SelectByYear sendPostRequest={sendPostRequest} /></div>
                <div className="sheet-title">Per data</div>
                <div className="sheet flex flex-col items-center gap-4"><SelectByDate sendPostRequest={sendPostRequest} /></div>
            </div>
        </div>
    );
}