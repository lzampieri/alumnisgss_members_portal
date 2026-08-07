import { useForm, usePage } from "@inertiajs/react";
import Select from 'react-select';
import TextareaAutosize from 'react-textarea-autosize';
import EmptyDialog from "../Layout/EmptyDialog";
import Backdrop from "../Layout/Backdrop";

// This guy is inserted into Associate.js
export default function NewExternal({ subject, open, setOpen }) {

    const { data, setData, post, processing, errors } = useForm({
        surname: '',
        name: '',
        notes: ''
    })

    const submit = (e) => {
        e.preventDefault();
        post(route('externals.create_and_associate', { email: subject.id }));
    }


    return <EmptyDialog open={open} onClose={() => setOpen(false)}>
        <h3>Crea nuovo esterno</h3>
        <div className="text-error font-bold p-2">Prima di creare una nuova identità, controllare con attenzione che non sia già presente, per evitare doppioni.</div>
        <div className="font-bold p-2">Non è possibile registrare nuove identità di alumni da qui, ma solo di esterni. Per nuovi alumni, usare l'applicativo <i>anagrafe</i>.</div>
        <form className="flex flex-col mx-2" onSubmit={submit}>
            <label>Cognome</label>
            <input type="text" value={data.surname} onChange={(e) => setData('surname', e.target.value)} />
            <label className="error">{errors.surname}</label>
            <label>Nome</label>
            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            <label className="error">{errors.name}</label>
            <label>Note (ad esempio, il motivo per cui ha un rapporto con l'associazione)</label>
            <TextareaAutosize
                className="w-full pretendToBeInput"
                minRows={3}
                value={data.notes}
                onChange={(e) => setData('notes', e.target.value)} />
            <label className="error">{errors.notes}</label>
            <input type="button" className="button mt-4" onClick={submit} value="Salva, associa ed abilita" />
        </form>
        <Backdrop open={processing} />
    </EmptyDialog>
}