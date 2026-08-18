

import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import { AlumnusStatus } from "../Utils";
import { faArrowsLeftRightToLine, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NurDate, NurDatePicker } from "../Libs/DateEditor";

function YearPicker({ year, setYear }) {
    return (
        <div className="flex flex-row items-center">
            <FontAwesomeIcon icon={faChevronLeft} className="w-full discrete-button" onClick={() => setYear(year - 1)} />
            <div className="text-xl font-bold px-2">{year}</div>
            <FontAwesomeIcon icon={faChevronRight} className="w-full discrete-button" onClick={() => setYear(year + 1)} />
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
            new NurDate(from, 1, 1),
            new NurDate(to, 12, 31)
        )
    }

    return <>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <YearPicker year={from} setYear={(newYear) => updateFrom(newYear)} />
            <FontAwesomeIcon icon={faArrowsLeftRightToLine} className="block rotate-90 md:hidden" />
            <FontAwesomeIcon icon={faArrowsLeftRightToLine} className="hidden md:block" />
            <YearPicker year={to} setYear={(newYear) => updateTo(newYear)} />
        </div>
        <div className="button w-fit" onClick={send}>Genera</div>
    </>
}

function SelectByDate({ sendPostRequest }) {
    const [from, setFrom] = useState(new NurDate(new Date().getFullYear(), 1, 1));
    const [to, setTo] = useState(new NurDate(new Date().getFullYear(), 12, 31));

    return <>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <NurDatePicker classNames='w-full' value={from} onChange={(date) => setFrom(date)} />
            <FontAwesomeIcon icon={faArrowsLeftRightToLine} className="block rotate-90 md:hidden" />
            <FontAwesomeIcon icon={faArrowsLeftRightToLine} className="hidden md:block" />
            <NurDatePicker classNames='w-full' value={to} onChange={(date) => setTo(date)} />
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

    const sendPostRequest = (from, to) => {
        window.location = route('reports.members_variations.generate',
            {
                statuses: statuses.join(';') || "None",
                from: from.toJSON(),
                to: to.toJSON()
            });
    }

    return (
        <div className="main-container">
            <Head title="Variazioni nei libri societari" />
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