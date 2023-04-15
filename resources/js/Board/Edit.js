import { useForm, usePage } from "@inertiajs/react";
import { AlumnusStatus, Documents, romanize } from "../Utils";
import IdSelector from "./IdSelector";
import Datepicker from "tailwind-datepicker-react"
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";
import Dialog from "../Layout/Dialog";
import { router } from "@inertiajs/react";
import NewVersion from "./NewVersion";
import AddRatification from "./AddRatification";
import DeleteRatification from "./DeleteRatification";
import RolesChips from "../Permissions/RolesChips";

export default function Edit() {
    const prevDoc = usePage().props.document;
    const roles = usePage().props.roles;
    const rats = prevDoc.grouped_ratifications;

    const { data, setData, post, processing, errors, isDirty } = useForm({
        roles: prevDoc.dynamic_permissions.map(dp => dp.role_id),
        date: new Date(prevDoc.date),
        note: prevDoc.note || "",
    })

    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('board.edit', { document: prevDoc.id }));
    }

    const submitDelete = () => {
        router.post(route('board.delete', { document: prevDoc.id }));
    }

    return (
        <div className="flex flex-col w-full md:w-3/5">
            <h3>Modifica documento</h3>
            <span className="font-bold">Protocollo web: {prevDoc.protocol}</span>

            <form className="flex flex-col w-full" onSubmit={submit}>
                <label>Identificativo</label>
                {prevDoc.identifier}
                <label className="unspaced">L'identiticativo non può essere modificato a posteriori.</label>
                <label>Visibilità</label>
                <RolesChips roles={roles} list={data.roles} updateList={(newList) => setData('roles', newList)} />
                <label className="error">{errors.privacy}</label>
                <label>Data di redazione</label>
                <Datepicker classNames='w-full' options={{ defaultDate: data.date, maxDate: new Date(), language: 'it', theme: { input: '!text-black' } }} onChange={(date) => setData('date', date)} show={datePickerOpen} setShow={setDatePickerOpen} />
                <label className="error">{errors.date}</label>
                <label>Note</label>
                <input type="text" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                <label className="error">{errors.note}</label>
                <input type="button" className="button mt-4" onClick={submit} value="Salva" />
            </form>

            <div className="thin-separator" />

            <label>Versioni</label>
            <ol className="list-disc list-inside">
                {prevDoc.files.map( (f, index) =>
                    <li key={f.id}><a href={route('board.view_file', { file: f.id })} className={ index == prevDoc.files.length - 1 ? "font-bold" : ""}>Versione {index+1}</a></li>
                )}
            </ol>
            <label className="unspaced">Si noti che solo l'ultima versione rimane visibile, secondo le opzioni di privacy selezionate. Inoltre, per questioni di protocollazione, vecchie versioni non possono essere eliminate, nemmeno se errate.</label>
            <NewVersion document={prevDoc} />

            <div className="thin-separator" />

            <label>Ratifiche approvate</label>
            {rats.constructor == Object ? <>
                <DeleteRatification ratifications={rats} />
            </> : <label className="unspaced">Nessuna ratifica presente</label>}
            <AddRatification document={prevDoc} />

            <div className="thin-separator" />

            <button className="button mt-8 text-center" onClick={(e) => { e.preventDefault(); setDeleteDialogOpen(true) }}>Elimina</button>
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={() => submitDelete()}>
                Sei sicuro di voler eliminare il documento {prevDoc.title}?
            </Dialog>
            <Backdrop open={processing} />
        </div>
    );
}