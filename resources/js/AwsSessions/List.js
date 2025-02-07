import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import Select from 'react-select';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function formatDayWithWeekday(date) {
    return capitalizeFirstLetter(new Date(date).toLocaleDateString('it-IT', { 'weekday': 'long', 'day': '2-digit', 'month': 'long', 'year': 'numeric' }))
}
function formatDay(date) {
    return new Date(date).toLocaleDateString('it-IT', { 'day': '2-digit', 'month': 'long', 'year': 'numeric' });
}
function formatTime(time) {
    return new Date(time).toLocaleTimeString('it-IT', { 'hour': '2-digit', 'minute': '2-digit' })
}
function lastOfDict(dict) {
    return dict[Object.keys(dict).slice(-1)];
}
function getMonthsArray() {
    return [...Array(12).keys()].map(d => {
        return {
            value: d + 1,
            label: capitalizeFirstLetter(new Date(2024, d, 5).toLocaleDateString('it-IT', { 'month': 'long' }))
        }
    });
}
function getYearsArray() {
    return [...Array(new Date().getFullYear() - 2023 + 1).keys()].map(d => {
        return {
            value: d + 2023,
            label: d + 2023
        }
    })
}

function DayCell(day, month, year) {
    const exists = day <= (new Date(year, month, 0).getDate());
    const weekend = ((new Date(year, month - 1, day).getDay()) == 0) || ((new Date(year, month - 1, day).getDay()) == 6);
    return <td key={day} className={"border" + (exists ? "" : " opacity-0 ") + (weekend ? " bg-[#ff7777] " : "")}>
        {day < 10 && '0'}{exists && day}
    </td>
}

function WorkedHoursCell(day, month, year, sessions) {
    let sum = 0;
    const exists = day <= (new Date(year, month, 0).getDate());

    if (exists)
        if ((year * 100 + month) in sessions)
            if ((year * 10000 + month * 100 + day) in sessions[year * 100 + month]) {
                sum = sessions[year * 100 + month][year * 10000 + month * 100 + day].reduce((acc, val) => acc + val.duration, 0) / 60;
            }

    if (sum > 0)
        return <td key={day + "_sess"} className={"border"}>{sum.toFixed(1)}</td>
    return <td key={day + "_sess"} className={"border"}></td>
}

function totalHoursInMonth(month, year, sessions) {
    let sum = 0;

    if ((year * 100 + month) in sessions)
        sum = Object.values(sessions[year * 100 + month]).reduce(
            (acc, val) => acc + val.reduce((accDay, valDay) => accDay + valDay.duration, 0),
            0) / 60

    if (sum > 0)
        return sum.toFixed(1);
    return "";
}

function DetailsTable(month, year, sessions) {

    if (!((year * 100 + month) in sessions))
        return <label>Nessuna sessione registrata nel mese selezionato</label>

    return <table className="w-full"><tbody>
        {Object.keys(sessions[year * 100 + month]).map(key => <tr key={key}>
            <td className="border">{formatDayWithWeekday(new Date(year, month - 1, key % 100))}</td>
            <td className="border">{sessions[year * 100 + month][key].map(e => SessionLine(e))}</td>
        </tr>)}
    </tbody></table>

}

function SessionLine(session) {
    if (session.endtime)
        return <div className="my-1" key={session.id}>
            <FontAwesomeIcon icon={solid('desktop')} className="mr-2" />
            Dalle {formatTime(session.starttime)} alle {formatTime(session.endtime)}
            <b> ({session.duration} minuti)</b>
        </div>
    return <div className="my-1" key={session.id}>
        <FontAwesomeIcon icon={solid('desktop')} className="mr-2 text-primary-main" />
        Dalle {formatTime(session.starttime)}
        <b> (in corso)</b>
    </div>
}


export default function List() {
    const sessions = usePage().props.sessions
    const lastSession = lastOfDict(lastOfDict(sessions)).slice(-1)[0]

    const monthsArray = getMonthsArray()
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const yearsArray = getYearsArray()
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [showDetails, setShowDetails] = useState(false); // to set false

    const changeMonth = diff => {
        let newMonth = selectedMonth + diff;
        let newYear = selectedYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear = selectedYear + 1;
        }
        if (newMonth < 1) {
            newMonth = 12;
            newYear = selectedYear - 1;
        }
        if (!yearsArray.map(y => y.value).includes(newYear))
            return
        setSelectedMonth(newMonth)
        setSelectedYear(newYear)
    }

    return (
        <>
            <div className="main-container">
                <div className="w-full flex flex-row justify-center items-center gap-2">
                    <div className="button" onClick={() => changeMonth(-1)}>&lt;</div>
                    <Select
                        classNames={{ control: () => 'selectDropdown' }}
                        value={monthsArray.find(m => m.value === selectedMonth)}
                        onChange={m => setSelectedMonth(m.value)}
                        options={monthsArray}
                        className="min-w-[10rem]"
                    />
                    <Select
                        classNames={{ control: () => 'selectDropdown' }}
                        value={yearsArray.find(m => m.value === selectedYear)}
                        onChange={m => setSelectedYear(m.value)}
                        options={yearsArray}
                        className="min-w-[5rem]"
                    />
                    <div className="button" onClick={() => changeMonth(+1)}>&gt;</div>
                </div>

                <h3 className="w-full mt-4">Sessioni registrate per il mese di {monthsArray.find(m => m.value === selectedMonth).label} {selectedYear}</h3>
            </div>
            <div className="main-container-drawer my-4">
                <table className="w-full table-fixed border text-center"><tbody>
                    <tr>
                        <td></td>
                        {[...Array(31).keys()].map(k => DayCell(k + 1, selectedMonth, selectedYear))}
                        <td>Tot</td>
                    </tr>
                    <tr>
                        <td>Ore</td>
                        {[...Array(31).keys()].map(k => WorkedHoursCell(k + 1, selectedMonth, selectedYear, sessions))}
                        <td className="border">{totalHoursInMonth(selectedMonth, selectedYear, sessions)}</td>
                    </tr>
                </tbody></table>
            </div>
            <div className="main-container !items-start">
                <div className="discrete-button" onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ?
                        <FontAwesomeIcon icon={solid('circle-chevron-up')} /> :
                        <FontAwesomeIcon icon={solid('circle-chevron-down')} />
                    }
                    <span className="ml-2">Mostra dettagli</span>
                </div>
                {showDetails && DetailsTable(selectedMonth, selectedYear, sessions)}

                <span className="text-sm mt-12">Nel sistema risulta un totale di {usePage().props.count} sessioni registrate. L'ultima sessione è stata iniziata il {formatDay(lastSession.starttime)}</span>
            </div>
        </>
    );
}