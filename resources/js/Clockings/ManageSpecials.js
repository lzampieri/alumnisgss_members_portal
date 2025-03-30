import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Backdrop from "../Layout/Backdrop";
import { bgAndContrast, postRequest } from "../Utils";
import { useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Collapse } from 'react-collapse';
import Select from 'react-select';
import { faL } from "@fortawesome/free-solid-svg-icons";

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

function daysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

function capFirst(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function getKey(month, day) {
    return month.getFullYear() + "-" + twoDigits(month.getMonth() + 1) + "-" + twoDigits(day + 1);
}

function Month({ m, selectable, selected, toggle }) {
    const specials = usePage().props.specials;
    const workedDays = usePage().props.workedDays;
    const zeroDay = (m.getDay() - 1 + 7) % 7;

    return <div className="grid grid-cols-7 items-start text-center gap-1">
        <div className="col-span-7 font-bold text-primary-main">{capFirst(m.toLocaleDateString('it-IT', { 'month': 'long', 'year': 'numeric' }))}</div>
        {["L", "M", "M", "G", "V"].map((d, i) => <div className="font-bold" key={i}>{d}</div>)}
        {["S", "D"].map(d => <div className="font-bold text-primary-main" key={d}>{d}</div>)}
        {[...Array(zeroDay).keys()].map(d => <div key={"00" + d}></div>)}
        {[...Array(daysInMonth(m.getMonth(), m.getFullYear())).keys()].map(d => {
            let style = {}
            let thisSelectable = selectable;
            if (specials[getKey(m, d)] && specials[getKey(m, d)].length > 0) {
                style = bgAndContrast(specials[getKey(m, d)][0].type.color)
                thisSelectable = false
            }
            if (workedDays.includes(getKey(m, d))) {
                style = bgAndContrast('#b6e3e7')
                thisSelectable = false
            }
            return <div className={
                "px-1 rounded " +
                ((zeroDay + d) % 7 > 4 ? "font-bold " : "") +
                (thisSelectable ? "cursor-pointer hover:outline hover:outline-black " : "") + 
                (thisSelectable && selected.includes(getKey(m, d)) ? "outline outline-primary-main " : "")
            } key={d} style={style} onClick={() => thisSelectable && toggle(getKey(m, d))}>
                {d + 1}
            </div>
        })}
    </div>
}

function SpecialsList({ isOpened }) {
    const specials = usePage().props.specials;
    const [deleting,setDeleting] = useState(false);

    return <Collapse theme={{ collapse: "w-full md:w-3/5 gap-1 cpm" }} isOpened={isOpened}>
        <div className="w-full border-2 border-primary-main rounded px-2 py-1 text-center mb-1">
            <h4>Eventi già inseriti</h4>
        </div>
        {Object.keys(specials).map(ss => specials[ss].map(s =>
            <div className="w-full border-2 border-primary-main rounded px-2 py-1 mb-1 flex flex-row gap-2" key={s.id}>
                <span className="font-bold">{new Date(s.date).toLocaleDateString()}</span>
                <span className="grow">{s.type.label}</span>
                <button className="icon-button" onClick={() => postRequest(
                    `clockings.manageSpecials.del`,
                    { id: s.id },
                    setDeleting
                )}>
                    <FontAwesomeIcon icon={solid('trash')} />
                </button>
            </div>
        ))}
        <Backdrop open={deleting} />
    </Collapse>
}

function AddPanel({ isOpened, typesOptions, data, setData, post }) {
    return <Collapse theme={{ collapse: "w-full md:w-3/5 gap-1 cpm" }} isOpened={isOpened}>
        <div className="w-full border-2 border-primary-main rounded px-2 py-1 text-center mb-1">
            <h4>Aggiungi evento</h4>
            Seleziona i giorni dal calendario qui sopra
            <Select
                classNames={{ control: () => 'selectDropdown' }}
                className="w-full my-1"
                value={typesOptions.find(i => i.value == data.type)}
                onChange={(sel) => setData('type', sel.value)}
                options={typesOptions} />
            <button className="button" disabled={!data.type || !typesOptions.map(i => i.value).includes(data.type) || data.days.length == 0} onClick={post}>
                <FontAwesomeIcon icon={solid('save')} className="mr-2" />
                Salva
            </button>
        </div>
    </Collapse>
}

export default function ManageSpecials() {

    const from = new Date(usePage().props.from);
    const to = new Date(usePage().props.to);


    const allTypes = usePage().props.allTypes;


    const monthsList = [from];
    while (monthsList[monthsList.length - 1] < to) {
        monthsList.push(new Date(new Date(monthsList[monthsList.length - 1]).setMonth(monthsList[monthsList.length - 1].getMonth() + 1)));
    }
    monthsList.pop();

    const [adding, setAdding] = useState(false);
    const { data, setData, post, processing } = useForm({
        days: [],
        type: allTypes[0]?.tag
    })

    return <div className="main-container-large gap-4">
        <h3>Gestione ferie e permessi</h3>
        Oggi puoi gestire le ferie e i permessi per il periodo dal {from.toLocaleDateString()} al {to.toLocaleDateString()}

        <div className="flex flex-row gap-2">
            <div key='worked' style={bgAndContrast('#b6e3e7')} className="px-2 py-1 rounded">Lavorati</div>
            {allTypes.map(t => !(['work', 'default'].includes(t.tag)) && <div key={t.tag} style={bgAndContrast(t.color)} className="px-2 py-1 rounded">{t.label}</div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-12">
            {monthsList.map(m => <Month m={m} key={m.getMonth()} selectable={adding} selected={data.days} toggle={day => setData('days', data.days.includes(day) ? data.days.filter(d => d != day) : data.days.concat([day]))} />)}
        </div>

        <SpecialsList isOpened={!adding} />

        <div className="button" onClick={() => setAdding(!adding)}>
            <FontAwesomeIcon icon={adding ? solid('xmark') : solid('plus')} className="mr-2" />
            {adding ? "Annulla" : "Aggiungi"}
        </div>

        <AddPanel
            isOpened={adding}
            typesOptions={allTypes.filter(t => !['work', 'default'].includes(t.tag)).map(t => ({ label: t.label, value: t.tag }))}
            data={data}
            setData={setData}
            post={() => post(route('clockings.manageSpecials.add'), { preserveState: false })} />

        <Backdrop open={processing} />

        {/* <div className="flex flex-row gap-2 items-center">
            <Link as="button" className="button" href={route('clockings.monthly', month == 1 ? { year: year - 1, month: 12 } : { year: year, month: month - 1 } )}>
                <FontAwesomeIcon icon={solid('chevron-left')} />
            </Link>
            <h3>{ capFirst( date.toLocaleDateString('it-IT',{ 'month': 'long', 'year': 'numeric' }) )}</h3>
            <Link as="button" className="button" href={route('clockings.monthly', month == 12 ? { year: year + 1, month: 1 } : { year: year, month: month + 1 } )} disabled={!nextAvailable}>
                <FontAwesomeIcon icon={solid('chevron-right')} />
            </Link>
        </div>
        <Table daysCount={ daysInMonth(month, year) } dateString={"" + year + "-" + twoDigits(month) + "-"} /> */}
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