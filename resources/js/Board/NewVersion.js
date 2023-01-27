import { useForm, usePage } from "@inertiajs/inertia-react";
import { AlumnusStatus, Documents, romanize } from "../Utils";
import IdSelector from "./IdSelector";
import Datepicker from "tailwind-datepicker-react"
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";

export default function NewVersion() {
    const document = usePage().props.document;

    const { data, setData, post, processing, errors, progress } = useForm({
        file: ''
    })

    const submit = (e) => {
        e.preventDefault();

        post(route('board.new_version', {document: document.id}));
    }

    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <h3>Modifica documento</h3>
            <span className="font-bold">Protocollo web: {document.protocol}</span>
            <label>Identificativo</label>
            {document.identifier}
            <label>Visibilità</label>
            <div className="w-full flex flex-row flex-wrap justify-start">
                <div className="chip px-4 py-2 cursor-pointer">
                    {Documents.names[document.privacy] || document.privacy}
                </div>
            </div>
            <label>Data di redazione</label>
            { new Date(document.date).toLocaleDateString('it-IT', { 'dateStyle': 'long' }) }
            <label>Note</label>
            { document.note }
            <label>File</label>
            <input type="file" onChange={e => setData('file', e.target.files[0])} accept=".pdf" />
            <label className="error">{errors.file}</label>
            <input type="button" className="button mt-4" onClick={submit} value="Salva" />
            <Backdrop open={processing} />
        </form>
    );
}