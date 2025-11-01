import { Head, Link, usePage, progress, router } from "@inertiajs/react";
import Backdrop from "../Layout/Backdrop";
import { useState } from "react";

export default function View() {
    const newsletter = usePage().props.newsletter;

    console.log(newsletter);
    console.log(usePage().props.alladdresses_sent);

    return (
        <div className="flex flex-col w-full md:w-3/5">
            <Head title={newsletter.subject + " | Inviata"} />
            <h3>Newsletter</h3>
            <b>Oggetto: {newsletter.subject}</b>
            {newsletter.sent_at && <div className="mb-4 text-gray-400">Newsletter inviata il {new Date(newsletter?.sent_at).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>}
            <div className="w-full" dangerouslySetInnerHTML={{ __html: newsletter.body }} />
            {newsletter.attachments?.length > 0 && <label>Allegati:</label>}
            {
                newsletter.attachments?.map((f, idx) =>
                    <a target="_blank" href={route('newsletter.attachment', { id: f.id })}>{f.handle}</a>
                )
            }
            <label>Destinatari di questo singolo invio:</label>
            {newsletter.to?.join(", ")}

            <br/>
            <label>Destinatari di tutto il blocco di invii ({usePage().props.alladdresses_sent.length || "0"} già inviate, {usePage().props.alladdresses_waiting.length || "0"} ancora in attesa):</label>
            {usePage().props.alladdresses_sent.join(", ")}<span className="text-gray-300 italic">{usePage().props.alladdresses_waiting.join(", ")}</span>
        </div>
    );
}