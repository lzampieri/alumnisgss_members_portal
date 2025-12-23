

import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { hhmm, totalCount, twoDigits, withQuartersAndHours } from "./TimeUtils";
import EmptyDialog from "../Layout/EmptyDialog";
import TextareaAutosize from 'react-textarea-autosize';
import Backdrop from "../Layout/Backdrop";
import { faComment, faHourglass, faHourglassHalf, faScrewdriverWrench, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function TooMuchTime() {
    const [addComment, setAddComment] = useState(false);
    const stamps = usePage().props.stamps;
    const lastStamp = stamps[stamps.length - 1];
    const expectedHours = usePage().props.expectedHours;

    const { data, setData, processing, errors, post } = useForm({
        note: lastStamp.note || '',
        id: lastStamp.id
    })

    const submit = () => {
        post(route('clockings.addnote'), { onSuccess: () => router.visit(route('clockings.monthly')) });
    }

    return (
        <div className="main-container gap-4">
            <Head title="Timbratore" />
            <div className="unlclickable-button flex flex-col text-xl md:text-4xl font-bold aspect-square items-center justify-center gap-4">
                <FontAwesomeIcon icon={faTriangleExclamation} className="text-5xl" />
                Attenzione
            </div>
            <div className="w-full">È stato rilevato per la data odierna un eccesso di ore lavorative. In particolare risultano lavorate <b>{withQuartersAndHours(totalCount(stamps))}</b> a fronte delle <b>{withQuartersAndHours(expectedHours)}</b> attese.</div>
            <div className="w-full">Le ore di lavoro risultano dalle seguenti timbrature:
                <ul className="list-disc list-inside">
                    {stamps.map((stamp) =>
                        <li key={stamp.id}>
                            {stamp.type.label}
                            {stamp.clockin ? " - Ingresso: " + hhmm(stamp.clockin) : ""}
                            {stamp.clockout ? " - Uscita: " + hhmm(stamp.clockout) : ""}
                            {stamp.clockout ? " - Totale: " + withQuartersAndHours(stamp.hours) : ""}
                            {stamp.acpttickets.map((t) =>
                                <Link className="icon-button-gray" href={route('ticket.view', { ticket: t.id })} key={t.id}>
                                    <FontAwesomeIcon icon={faScrewdriverWrench} />
                                </Link>
                            )}
                            {stamp.opentickets.map((t) =>
                                <Link className="icon-button-gray" href={route('ticket.view', { ticket: t.id })} key={t.id}>
                                    <FontAwesomeIcon icon={faHourglassHalf} />
                                </Link>
                            )}
                            {
                                (stamp.clockin || stamp.clockout) &&
                                <Link className="icon-button" href={route('ticket.add', { type: 'EditStamp', stampId: stamp.id })} key={'edit' + stamp.id}>
                                    <FontAwesomeIcon icon={faScrewdriverWrench} />
                                </Link>
                            }
                        </li>)}
                </ul>
            </div>

            <Link className="button" href={route('ticket.add', { type: 'EditStamp', stampId: lastStamp.id })}>
                <FontAwesomeIcon icon={faScrewdriverWrench} className="mr-2" />
                Apri una richiesta per la modifica dell'ultima timbratura
            </Link>

            <div className="button" onClick={() => setAddComment(true)}>
                <FontAwesomeIcon icon={faComment} className="mr-2" />
                Aggiungi un commento all'ultima timbratura
            </div>

            <EmptyDialog open={addComment} onClose={() => setAddComment(false)}>
                <b>Aggiungi un commento all'ultima timbratura</b>
                {lastStamp.type.label}
                {lastStamp.clockin ? " - Ingresso: " + hhmm(lastStamp.clockin) : ""}
                {lastStamp.clockout ? " - Uscita: " + hhmm(lastStamp.clockout) : ""}
                {lastStamp.clockout ? " - Totale: " + withQuartersAndHours(lastStamp.hours) : ""}
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

            { /*<b>Se si tratta di un errore</b>
            
            <a href={route('auth.login.google')} className="button">Rifai l'accesso</a><br />
            <b>Se vuoi visualizzare solo la parte pubblica del portale</b>
            <Link href={route('home')} className="button">Torna alla home</Link><br />
            <b>Se sei un aspirante socio</b>
            Iscriviti all'associazione compilando il modulo dedicato; non appena la tua richiesta sarà registrata, ti sarà attivato l'accesso al portale!
            <Link href={route('permalink', {permalink: 'diventa-socio'})} className="button">Vai al modulo</Link><br />
            <b>Se sei un socio (ordinario, studente o preiscritto) o se hai qualche collaborazione con la scuola</b>
            <a onClick={(e) => { e.preventDefault(); setAccessRequest(true); }} className="button" style={{ display: accessRequest ? 'none' : 'block' }}>Richiedi l'accesso</a>
            <form onSubmit={submit} className="flex-col w-full" style={{ display: accessRequest ? 'flex' : 'none' }}>
                <label>L'accesso verrà richiesto per {data.address}</label>
                <label className="error">{errors.address}</label>
                <label>È possibile lasciare un messaggio per la segreteria</label>
                <label className="error">{errors.comment}</label>
                <textarea className="textarea-container" rows={lines} value={data.comment} onChange={setComment} />
                <input type="submit" className="button" value="Invia richiesta" onClick={submit} />
            </form> */}
        </div>
    )
}