import { useForm, usePage } from "@inertiajs/react";
import EmptyDialog from "../Layout/EmptyDialog";
import Backdrop from "../Layout/Backdrop";
import TextareaAutosize from 'react-textarea-autosize';

// This guy is inserted into List.js
export default function ManuallyAdd({ open, setClosed }) {
    const { data, setData, post, processing, errors } = useForm({
        address: '',
        comment: 'Aggiunta manualmente'
    })

    const submit = (e) => {
        e.preventDefault();
        post(route('emails.manually_add'), { onFinish: () => setClosed() });

    }

    return <EmptyDialog open={open} onClose={setClosed}>
        <form className="flex flex-col w-full" onSubmit={submit}>
            <h3>Inserisci nuovo indirizzo mail</h3>
            <label>Indirizzo</label>
            <input type="text" value={data.address} onChange={(e) => setData('address', e.target.value)} />
            <label className="error">{errors.address}</label>
            <label>Commento</label>
            <TextareaAutosize
                className="w-full pretendToBeInput"
                minRows={3}
                value={data.comment}
                onChange={(e) => setData('comment', e.target.value)} />
            <label className="error">{errors.comment}</label>
            <input type="button" className="button mt-4" onClick={submit} value="Aggiungi" />
        </form>
        <Backdrop open={processing} />
    </EmptyDialog>
}