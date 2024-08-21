import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Datepicker from "tailwind-datepicker-react"
import { useState } from "react";

function YearPicker({ year, setYear }) {
    return (
        <div className="flex flex-row items-center">
            <FontAwesomeIcon icon={solid('chevron-left')} className="w-full discrete-button" onClick={() => setYear(year - 1)} />
            <div className="text-xl font-bold px-2">{year}</div>
            <FontAwesomeIcon icon={solid('chevron-right')} className="w-full discrete-button" onClick={() => setYear(year + 1)} />
        </div>
    )
}

function SelectByYear() {
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

    return <>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <YearPicker year={from} setYear={(newYear) => updateFrom(newYear)} />
            <FontAwesomeIcon icon={solid('arrows-left-right-to-line')} className="block rotate-90 md:hidden" />
            <FontAwesomeIcon icon={solid('arrows-left-right-to-line')} className="hidden md:block" />
            <YearPicker year={to} setYear={(newYear) => updateTo(newYear)} />
        </div>
        <div className="button w-fit">Genera</div>
    </>
}

function SelectByDate() {
    const [from, setFrom] = useState(new Date( new Date().getFullYear(), 0 ));
    const [to, setTo] = useState(new Date( new Date( new Date().getFullYear() + 1, 0 ) - 1 ) );

    const [datePickerOpenFrom, setDatePickerOpenFrom] = useState(false);
    const [datePickerOpenTo, setDatePickerOpenTo] = useState(false);

    return <>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <Datepicker classNames='w-full' options={{ defaultDate: from, language: 'it', theme: { input: '!text-black' } }} onChange={(date) => setFrom(date)} show={datePickerOpenFrom} setShow={setDatePickerOpenFrom} />
            <FontAwesomeIcon icon={solid('arrows-left-right-to-line')} className="block rotate-90 md:hidden" />
            <FontAwesomeIcon icon={solid('arrows-left-right-to-line')} className="hidden md:block" />
            <Datepicker classNames='w-full' options={{ defaultDate: to, language: 'it', theme: { input: '!text-black' } }} onChange={(date) => setTo(date)} show={datePickerOpenTo} setShow={setDatePickerOpenTo} />
        </div>
        <div className="button w-fit">Genera</div>
    </>
}

export default function MembersVariations() {

    return (
        <div className="main-container">
            <h3>Variazioni nei libri societari</h3>
            <div className="sheets-container">
                <div className="sheet-title">Per anno</div>
                <div className="sheet flex flex-col items-center gap-4"><SelectByYear /></div>
                <div className="sheet-title">Per data</div>
                <div className="sheet flex flex-col items-center gap-4"><SelectByDate /></div>
            </div>
        </div>
    );
}