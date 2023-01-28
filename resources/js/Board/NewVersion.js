import { useForm } from "@inertiajs/inertia-react";
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";
import EmptyDialog from "../Layout/EmptyDialog";

export default function NewVersion({ document }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, progress } = useForm({
        file: ''
    })

    const submit = (e) => {
        e.preventDefault();
        setOpen(false);
        post(route('board.new_version', { document: document.id }));
    }

    return (<>
        <div className="button self-start" onClick={() => setOpen(true)}>Carica revisione</div>
        <EmptyDialog open={open}
            onClose={() => setOpen(false)}>
            <form className="flex flex-col w-full" onSubmit={submit}>
                <label>File</label>
                <input type="file" onChange={e => setData('file', e.target.files[0])} accept=".pdf" />
                <label className="error">{errors.file}</label>
                <input type="button" className="button mt-4" onClick={submit} value="Salva" />
            </form>
        </EmptyDialog>
        <Backdrop open={processing} />
    </>);
}