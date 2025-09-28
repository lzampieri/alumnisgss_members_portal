import { Head, Link, usePage, progress, router } from "@inertiajs/react";
import Backdrop from "../Layout/Backdrop";
import { useState } from "react";

export default function Preview() {
    const newsletter = usePage().props.newsletter;
    const sentTo = usePage().props.sentTo;
    const [loading, setIsLoading] = useState(false);

    router.on('start', () => setIsLoading(true));
    router.on('finish', () => setIsLoading(false));


    return (
        <div className="flex flex-col w-full md:w-3/5">
            <Head title={newsletter.subject + " | Anteprima"} />
            <h3>Anteprima newsletter</h3>
            {sentTo && <div className="mb-4">Newsletter di prova inviata a: {sentTo}</div>}
            <b>Oggetto: {newsletter.subject}</b>
            <div className="w-full" dangerouslySetInnerHTML={{ __html: newsletter.body }} />
            {newsletter.attachments?.length > 0 && <label>Allegati:</label>}
            {
                newsletter.attachments?.map((f, idx) =>
                    <a target="_blank" href={route('newsletter.attachment', { id: f.id })}>{f.handle}</a>
                )
            }
            <label>Destinatari:</label>
            {newsletter.to?.join(", ")}
            {usePage().props.canSend ?
                <Link className="button self-end" href={route('newsletter.send', { newsletter: newsletter.id })}>Conferma invio</Link>
                : <label className="self-end">Non sei autorizzato a procedere all'invio finale di questa newsletter. Chiedi a qualcuno di autorizzato di confermare l'invio.</label>}
            <Backdrop open={loading} text="Invio in corso. Potrebbe volerci un po'. Non chiudere questa pagina." />
        </div>
    );
}