import { Head, Link, usePage, progress, router } from "@inertiajs/react";
import Backdrop from "../Layout/Backdrop";
import { useState } from "react";
import { asyncPostWithResult } from "../Utils";
import { enqueueSnackbar } from "notistack";
import EmptyDialog from "../Layout/EmptyDialog";


export default function Preview() {
    const newsletter = usePage().props.newsletter;
    const sentTo = usePage().props.sentTo;
    const [loading, setIsLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [serverDialog, setServerDialog] = useState(false);

    const [sendTo, setSendTo] = useState("");

    router.on('start', () => setIsLoading(true));
    router.on('finish', () => setIsLoading(false));


    const sendExtra = async () => {
        setTestLoading(true);
        asyncPostWithResult('newsletter.preview', { sendTo: sendTo }, { newsletter: newsletter.id })
            .then(data => enqueueSnackbar("Inviata a " + data.sentTo, { variant: "success" }))
            .catch(e => enqueueSnackbar("Errore, sorry", { variant: "error" }))
            .finally(() => setTestLoading(false));
    }

    return (
        <div className="flex flex-col w-full md:w-3/5">
            <Head title={newsletter.subject + " | Anteprima"} />
            <h3>Anteprima newsletter</h3>
            {sentTo && <div className="mb-4">Newsletter di prova inviata a: {sentTo}</div>}
            <div className="flex flex-row w-full">
                <label>Invia newsletter di prova a:</label>
                <input className="mx-2 grow" type="email" value={sendTo} onChange={(e) => setSendTo(e.target.value)} />
                <div
                    className="button"
                    href={route('newsletter.send', { newsletter: newsletter.id, sendTo })}
                    onClick={sendExtra}
                >Invia test</div>
            </div>
            <b>Oggetto: {newsletter.subject}</b>
            <div className="w-full" dangerouslySetInnerHTML={{ __html: newsletter.body }} />
            {newsletter.attachments?.length > 0 && <label>Allegati:</label>}
            {
                newsletter.attachments?.map((f, idx) =>
                    <a target="_blank" href={route('newsletter.attachment', { id: f.id })}>{f.handle}</a>
                )
            }
            <label>Destinatari ({newsletter.countTo}):</label>
            {newsletter.allTo?.join(", ")}
            {usePage().props.canSend ?
                <Link className="button self-end" href={route('newsletter.send', { newsletter: newsletter.id })}>Conferma invio</Link>
                : <label className="self-end">Non sei autorizzato a procedere all'invio finale di questa newsletter. Chiedi a qualcuno di autorizzato di confermare l'invio.</label>}
            {usePage().props.canSendServer ?
                <div className="button self-end" onClick={() => setServerDialog(true)}>Richiedi invio tramite server SMTP</div>
                : <label className="self-end">Non sei autorizzato a procedere all'invio finale di questa newsletter tramite server SMTP. Se vuoi inviare la newsletter via server SMTP (ad esempio perché ha troppi destinatari per l'inivio classico), chiedi a qualcuno di autorizzato di confermare l'invio.</label>}
            <EmptyDialog open={serverDialog} onClose={() => setServerDialog(false)}>
                Vuoi programmare l'invio della newsletter via server SMTP? La programmazione richiederà pochi secondi, ma l'invio effettivo potrà richiedere diverso tempo (si stima {usePage().props.serverETA} ore).
                <div className="w-full flex flex-row justify-center">
                    <div className="button mr-2" onClick={() => setServerDialog(false)}>Annulla</div>
                    <Link  className="button" href={route('newsletter.sendSMTP', { newsletter: newsletter.id })}>Programma</Link>
                </div>
            </EmptyDialog>
            <Backdrop open={loading} text="Invio in corso. Potrebbe volerci un po'. Non chiudere questa pagina." />
            <Backdrop open={testLoading} text="Invio di prova in corso." />
        </div>
    );
}