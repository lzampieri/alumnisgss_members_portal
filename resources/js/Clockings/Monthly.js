import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Backdrop from "../Layout/Backdrop";
import { postRequest } from "../Utils";
import { Fragment, useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useStopwatch, useTime } from "react-timer-hook";
import { totalCount, twoDigits, withQuartersAndHours, withQuartersGT0, withQuarters, daysInMonth, hhmm } from "./TimeUtils";
import EmptyDialog from "../Layout/EmptyDialog";
import TextareaAutosize from 'react-textarea-autosize';

function Cell({ children, bold, left, color }) {
    return <div className={"justify-self-stretch flex border-r "
        + (bold ? "font-bold " : (color ? " bg-gray-100 border-gray-300 " : " bg-gray-200 border-white "))
        + (left ? " justify-start pr-5 pl-1" : " justify-center ")}>
        <span>{children}</span>
    </div>
}

function Table({ daysCount }) {
    const data = usePage().props.data

    return <div className="grid w-full max-w-full overflow-x-auto" style={{ 'gridTemplateColumns': 'minmax(auto, 10fr) repeat(31, minmax(2rem, 1fr))' }}>
        {[...Array(32).keys()].map(i =>
            <Cell key={i} bold>{(i > 0 && i <= daysCount) ? i : ''}</Cell>)}
        {data.map((d, id) => <Fragment key={id}>
            <Cell key={d.id + "-0"} left color={id % 2}>{d.name} {d.surname}</Cell>
            {[...Array(31).keys()].map(i => <Cell key={d.id + "-" + i} className="justify-self-center" color={id % 2}>
                {withQuartersGT0(totalCount(d.stamps_grouped[i + 1]))}
            </Cell>)}
        </Fragment>)}
        {data.length == 0 && <div className="justify-self-stretch bg-gray-100 text-center col-span-full">Nessun dipendente in servizio questo mese.</div>}
    </div>

}

function FullList({ dateString }) {
    const allStamps = usePage().props.data

    const [toComment, setToComment] = useState(null)
    const { data, setData, processing, errors, post, reset } = useForm({
        note: '',
        id: -1
    })
    const submit = () => {
        post(route('clockings.addnote'), { onSuccess: () => reset() });
    }
    const openDialog = (stamp) => {
        setToComment(stamp)
        setData({ 'id': stamp.id, 'note': stamp.note || '' })
    }
    // console.log(allStamps);

    return <div className="w-full md:w-3/5">
        {allStamps.map((d, id) => <Fragment key={id}>
            <h4>{d.name} {d.surname}</h4>
            <table><tbody>
                {Object.keys(d.stamps_grouped).map((day) => <tr key={day}>
                    <td className="align-top pr-2"><b>{twoDigits(day)}{dateString}</b></td>
                    <td>
                        {d.stamps_grouped[day].map((stamp) =>
                            <div key={stamp.id}>
                                {stamp.type.label}
                                {stamp.clockin ? " - Ingresso: " + hhmm(stamp.clockin) : ""}
                                {stamp.clockout ? " - Uscita: " + hhmm(stamp.clockout) : ""}
                                {stamp.clockout ? " - Totale: " + withQuartersAndHours(stamp.hours) : ""}
                                {stamp.acpttickets.map((t) =>
                                    <Link className="icon-button-gray" href={route('ticket.view', { ticket: t.id })} key={t.id}>
                                        <FontAwesomeIcon icon={solid('screwdriver-wrench')} />
                                    </Link>
                                )}
                                {stamp.opentickets.map((t) =>
                                    <Link className="icon-button-gray" href={route('ticket.view', { ticket: t.id })} key={t.id}>
                                        <FontAwesomeIcon icon={solid('hourglass-half')} />
                                    </Link>
                                )}
                                {
                                    (stamp.clockin || stamp.clockout) && (d.mayOpenTicket) &&
                                    <Link className="icon-button" href={route('ticket.add', { type: 'EditStamp', stampId: stamp.id })} key={'edit' + stamp.id}>
                                        <FontAwesomeIcon icon={solid('screwdriver-wrench')} />
                                    </Link>
                                }
                                {
                                    (stamp.clockin || stamp.clockout) && (d.mayOpenTicket) &&
                                    <span className="icon-button" onClick={() => openDialog(stamp)} key={'comment' + stamp.id}>
                                        <FontAwesomeIcon icon={solid('comment')} />
                                    </span>
                                }
                                {stamp.note && <div className="italic text-sm">Nota: {stamp.note}</div>}
                            </div>)}
                    </td>
                </tr>)}
            </tbody></table>
        </Fragment>)}
        <EmptyDialog open={data?.id >= 0} onClose={() => setData('id', -1)}>
            <b>Aggiungi un commento alla timbratura</b>
            {toComment?.type.label}
            {toComment?.clockin ? " - Ingresso: " + hhmm(toComment.clockin) : ""}
            {toComment?.clockout ? " - Uscita: " + hhmm(toComment.clockout) : ""}
            {toComment?.clockout ? " - Totale: " + withQuartersAndHours(toComment.hours) : ""}
            <TextareaAutosize
                className="w-full pretendToBeInput mt-4"
                minRows={3}
                value={data.note}
                placeholder="Nota..."
                onChange={(e) => setData('note', e.target.value)} />
            <label className="error">{errors.note}</label>
            <input type="button" className="button mt-4" onClick={submit} value="Salva" />
        </EmptyDialog>
        <Backdrop open={processing} />
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
        <Head title={capFirst(date.toLocaleDateString('it-IT', { 'month': 'long', 'year': 'numeric' }))} />
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