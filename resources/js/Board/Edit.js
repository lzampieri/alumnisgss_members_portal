import { useForm, usePage } from "@inertiajs/inertia-react";
import { AlumnusStatus, Documents, romanize } from "../Utils";
import IdSelector from "./IdSelector";
import Datepicker from "tailwind-datepicker-react"
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";
import Dialog from "../Layout/Dialog";
import { Inertia } from "@inertiajs/inertia";

export default function Edit() {
    const prevDoc = usePage().props.document;
    const privacies = usePage().props.privacies;
    const rats = prevDoc.grouped_ratifications;

    const { data, setData, post, processing, errors, progress } = useForm({
        privacy: prevDoc.privacy,
        date: new Date(prevDoc.date),
        note: prevDoc.note || "",
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
            <span className="font-bold">Protocollo web: {prevDoc.handle}</span>
            <label className="unspaced">Alcune proprietà topiche del documento, quali l'identiticativo, il file e le ratifiche associate, non possono essere modificate a posteriori.</label>
            <label>Identificativo</label>
            { prevDoc.identifier }
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
            <label>File</label>
            <a href={route('board.view', { document: prevDoc.id })}>{prevDoc.handle}.pdf</a>
            { rats.constructor == Object && <>
                <label>Ratifiche approvate</label>
                { Object.keys( rats ).map( k => <div className="grid grid-cols-3" key={k}>
                    <label className="col-span-3"><i>Per il passaggio allo stato di <b>{ AlumnusStatus.status[k].label }</b></i></label>
                    { rats[k].map( r =>
                        <span key={r.id}>
                            { r.alumnus.surname } { r.alumnus.name } {r.id}<span className="text-gray-400"> {romanize(r.alumnus.coorte)}{r.alumnus.coorte != 0 && " coorte"}</span>
                        </span>
                    )}
                </div>)}
            </> }
            <input type="button" className="button mt-4" onClick={submit} value="Salva" />
            <button className="button mt-8 text-center" onClick={(e) => { e.preventDefault(); setDeleteDialogOpen(true) }}>Elimina</button>
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={() => submitDelete()}>
                Sei sicuro di voler eliminare il documento {prevDoc.title}?
            </Dialog>
            <Backdrop open={processing} />
        </form>
    );
}