import { useForm, usePage } from "@inertiajs/inertia-react";
import { Documents } from "../Utils";
import IdSelector from "./IdSelector";
import Datepicker from "tailwind-datepicker-react"
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";
import Dialog from "../Layout/Dialog";
import { Inertia } from "@inertiajs/inertia";

export default function Edit() {
    const prevDoc = usePage().props.document;
    const privacies = usePage().props.privacies;

    const { data, setData, post, processing, errors, progress } = useForm({
        privacy: prevDoc.privacy,
        identifier: prevDoc.identifier,
        date: new Date(prevDoc.date),
        note: prevDoc.note || ""
    })

    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('board.edit', { document: prevDoc.id }));
    }

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const submitDelete = () => {
        Inertia.post(route('board.delete', { document: prevDoc.id }));
    }

    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <h3>Modifica documento</h3>
            <span className="font-bold">Protocollo web: {document.handle}</span>
            <label>Identificativo</label>
            <IdSelector onChange={(idf) => setData('identifier', idf)} prevIdf={data.identifier} />
            <label className="error">{errors.identifier}</label>
            <label>Visibilità</label>
            <div className="w-full flex flex-row flex-wrap justify-start">
                {privacies.map(p =>
                    <div key={p} className={"chip px-4 py-2 cursor-pointer " + (p == data.privacy ? '' : 'disabled')} onClick={() => setData('privacy', p)}>
                        {Documents.names[p] || p}
                    </div>)}
            </div>
            <label className="error">{errors.privacy}</label>
            <label>Data di redazione</label>
            <Datepicker classNames='w-full' options={{ defaultDate: data.date, maxDate: new Date(), language: 'it', theme: { input: '!text-black' } }} onChange={(date) => setData('date', date)} show={datePickerOpen} setShow={setDatePickerOpen} />
            <label className="error">{errors.date}</label>
            <label>Note</label>
            <input type="text" value={data.note} onChange={(e) => setData('note', e.target.value)} />
            <label className="error">{errors.note}</label>
            <input type="button" className="button mt-4" onClick={submit} value="Salva" />
            <button className="button mt-8 text-center" onClick={(e) => { e.preventDefault(); setDeleteDialogOpen(true) }}>Elimina</button>
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={() => submitDelete()}>
                Sei sicuro di voler eliminare il documento {document.title}?
            </Dialog>
            <Backdrop open={processing} />
        </form>
    );
}