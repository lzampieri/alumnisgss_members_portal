import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useForm, usePage } from "@inertiajs/react";
import React, { useState } from "react";
import TextareaAutosize from 'react-textarea-autosize';
import Backdrop from "../Layout/Backdrop";
import { getStatusColor, getStatusLabel } from "./TktUtils";
import { bgAndContrastPastel, postRequest } from "../Utils";
import Dialog from "../Layout/Dialog";

function parseDate(value) {
    return new Date(value)?.toLocaleString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function GenerateContent({ type, value }) {
    if ((type == 'shortText') || (type == 'longText'))
        return <div className="rounded-md bg-gray-100 p-2">{value}</div>;
    if (type == 'date')
        return <div className="rounded-md bg-gray-100 p-2">{parseDate(value)}</div>;
}

function getNameAndSurname(guy) {
    let sur = guy?.surname || '';
    let nam = guy?.name || '';
    if (nam == '' && sur == '') return '-';
    return sur + " " + nam;
}

function Comment({ comment }) {
    return <div className="rounded-md bg-gray-100 p-2 mb-2">
        <span className="text-gray-700 text-sm">{getNameAndSurname(comment.author)} - {parseDate(comment.created_at)}</span><br />
        {comment.content}
    </div>;
}

function RequireConfirmAction({ label, callback }) {
    const [open, setOpen] = useState(false);

    return <>
        <button onClick={() => setOpen(true)} className="button">
            {label}
        </button>
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={() => { setOpen(false); callback() }}>
            <h4>{label}</h4><br />
            Sei sicuro?
        </Dialog>
    </>
}

export default function View() {
    const ticket = usePage().props.ticket;
    const fieldList = usePage().props.fieldList;
    const actionList = usePage().props.actionList;

    if (!ticket) return <></>;

    const { data, setData, processing, errors, post } = useForm({ content: '' });

    const [doingAction, setDoingAction] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('ticket.view', { ticket: ticket.id }), { preserveState: "errors", preserveScroll: true });
    }

    const doAction = (action) => {
        postRequest(
            'ticket.action',
            {},
            setDoingAction,
            { ticket: ticket.id, action: action },
        )
    }

    return <div className="main-container">
        <Link className="button self-start" href={route('helpdesk')}>
            <FontAwesomeIcon icon={solid('circle-left')} className="pr-2" />
            Indietro
        </Link>
        <h3 className="my-3">Ticket #{ticket.id}</h3>
        <h4>{usePage().props.commonName}: {ticket.instance.subject}</h4>

        <div className="w-full flex flex-col items-stretch">
            <label>Stato</label>
            <div className="rounded-md p-2 self-start" style={bgAndContrastPastel(getStatusColor(ticket.status))}>{getStatusLabel(ticket.status)}</div>

            {Object.keys(fieldList).map((key) => <React.Fragment key={key}>
                <label key={'lab_' + key}>{fieldList[key].label}</label>
                <GenerateContent key={key} type={fieldList[key].type} value={ticket.instance[key]} />
            </React.Fragment>)}

            <label>Autore</label>
            <GenerateContent type={'shortText'} value={getNameAndSurname(ticket.author)} />

            <label>Assegnatario</label>
            <GenerateContent type={'shortText'} value={getNameAndSurname(ticket.assigner)} />

            <label>Creazione</label>
            <GenerateContent type={'date'} value={ticket.created_at} />

            <label>Commenti</label>
            {ticket.comments.map((comment) => <Comment key={comment.id} comment={comment} />)}
            {ticket.comments.length == 0 && <div className="text-gray-400 text-sm">Nessun commento</div>}

            {usePage().props.canComment && <>
                <label>Aggiungi commento</label>
                <TextareaAutosize
                    className="w-full pretendToBeInput" minRows={3}
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)} />
                <label className="error">{errors['content']}</label>
                <button className="button self-end" onClick={submit} disabled={processing}>
                    <FontAwesomeIcon icon={solid('paper-plane')} className="pr-2" />
                    Commenta
                </button>
            </>}
        </div>

        {Object.keys(actionList).map(k =>
            <RequireConfirmAction
                key={k}
                label={actionList[k]}
                callback={() => doAction(k)} />
        )}

        <Backdrop open={processing || doingAction} />
    </div>
}