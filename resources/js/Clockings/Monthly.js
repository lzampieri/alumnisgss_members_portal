import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Backdrop from "../Layout/Backdrop";
import { postRequest } from "../Utils";
import { Fragment, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { useStopwatch, useTime } from "react-timer-hook";

function twoDigits(num) {
    return ("" + num).padStart(2, '0');
}

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function totalCount(d) {
    if (d == undefined) return '';
    let workCount = 0;

    for (let i = 0; i < d.length; i++) {
        if (d[i].type.tag == 'work')
            workCount += d[i].hours;
        else return d[i].type.acronym;
    }

    return workCount;
}

function Cell({ children, bold, left, color }) {
    return <div className={"justify-self-stretch flex border-r "
        + (bold ? "font-bold " : (color ? " bg-gray-100 border-gray-300 " : " bg-gray-200 border-white "))
        + (left ? " justify-start pr-5 pl-1" : " justify-center ")}>
        <span>{children}</span>
    </div>
}

function Table({ daysCount }) {
    const data = usePage().props.data
    console.log(data.length == 0)

    return <div className="grid w-full max-w-full overflow-x-auto" style={{ 'gridTemplateColumns': 'minmax(auto, 10fr) repeat(31, minmax(2rem, 1fr))' }}>
        {[...Array(32).keys()].map(i =>
            <Cell key={i} bold>{(i > 0 && i <= daysCount) ? i : ''}</Cell>)}
        {data.map((d, id) => <Fragment key={id}>
            <Cell key={d.id + "-0"} left color={id % 2}>{d.name} {d.surname}</Cell>
            {[...Array(31).keys()].map(i => <Cell key={d.id + "-" + i} className="justify-self-center" color={id % 2}>
                {totalCount(d.stamps_grouped[i + 1])}
            </Cell>)}
        </Fragment>)}
        {data.length == 0 && <div className="justify-self-stretch bg-gray-100 text-center col-span-full">Nessun dipendente in servizio questo mese.</div>}
    </div>

}

function hhmm( t ) {
    return new Date(t).toLocaleTimeString('it-IT', { 'hour': '2-digit', 'minute': '2-digit' });
}

function FullList({ dateString }) {
    const data = usePage().props.data

    return <div className="w-full md:w-3/5">
        {data.map((d, id) => <Fragment key={id}>
            <h4>{d.name} {d.surname}</h4>
            {Object.keys(d.stamps_grouped).map((day) => <Fragment key={day}>
                {d.stamps_grouped[day].map((stamp) =>
                    <div key={stamp.id}>
                        <b>{twoDigits(day)}{dateString} </b>
                        {stamp.type.label}
                        { stamp.clockin ? " - Ingresso: " + hhmm(stamp.clockin) : ""}
                        { stamp.clockout ? " - Uscita: " + hhmm(stamp.clockout) : ""}
                        { stamp.clockout ? " - Totale: " + stamp.hours + " ore" : ""}
                    </div>)}
            </Fragment>)}
        </Fragment>)}
        {/* {[...Array(32).keys()].map(i =>
            <Cell key={i} bold>{(i > 0 && i <= daysCount) ? i : ''}</Cell>)}
        {data.map((d,id) => <Fragment key={id}>
            <Cell key={d.id + "-0"} left color={id%2}>{d.name} {d.surname}</Cell>
            {[...Array(31).keys()].map(i => <Cell key={d.id + "-" + i} className="justify-self-center" color={id%2}>
                {totalCount(d.stamps_grouped[i + 1])}
            </Cell>)}
        </Fragment>)} */}
    </div>

}

export default function Monthly() {

    const year = usePage().props.year;
    const month = usePage().props.month;

    const today = new Date();
    const nextAvailable = (year < today.getFullYear()) || (year == today.getFullYear() && month < today.getMonth() + 1);
    const date = new Date(year, month - 1, 3);

    function capFirst(val) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    return <div className="main-container-large gap-4">
        <h3>Registro timbrature</h3>
        <div className="flex flex-row gap-2 items-center">
            <Link as="button" className="button" href={route('clockings.monthly', month == 1 ? { year: year - 1, month: 12 } : { year: year, month: month - 1 })}>
                <FontAwesomeIcon icon={solid('chevron-left')} />
            </Link>
            <h3>{capFirst(date.toLocaleDateString('it-IT', { 'month': 'long', 'year': 'numeric' }))}</h3>
            <Link as="button" className="button" href={route('clockings.monthly', month == 12 ? { year: year + 1, month: 1 } : { year: year, month: month + 1 })} disabled={!nextAvailable}>
                <FontAwesomeIcon icon={solid('chevron-right')} />
            </Link>
        </div>
        <Table daysCount={daysInMonth(month, year)} />
        <FullList dateString={"/" + twoDigits(month) + "/" + year} />
    </div>
}