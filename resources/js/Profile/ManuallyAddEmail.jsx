import { useForm, usePage } from "@inertiajs/react";
import EmptyDialog from "../Layout/EmptyDialog";
import Backdrop from "../Layout/Backdrop";
import { useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";



// This guy is inserted into Myself.js
export default function ManuallyAddEmail() {
    const { data, setData, post, processing, errors } = useForm({
        address: ''
    })

    const [open, setOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.add_email'), { onSuccess: () => setOpen(false) });
    }

    return <>
        <FontAwesomeIcon icon={faPlus} className="icon-button ml-2" onClick={() => setOpen(true)} />
        <EmptyDialog open={open} onClose={() => setOpen(false)}>
            <form className="flex flex-col w-full" onSubmit={submit}>
                <h3>Inserisci nuovo indirizzo mail</h3>
                <label>Indirizzo</label>
                <input type="text" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                <label className="error">{errors.address}</label>
                <input type="button" className="button mt-4" onClick={submit} value="Aggiungi" />
            </form>
            <Backdrop open={processing} />
        </EmptyDialog>
    </>
}