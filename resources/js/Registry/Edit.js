import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import Select from 'react-select';
import { AlumnusStatus } from "../Utils";
import Dialog from '../Layout/Dialog';
import { router } from "@inertiajs/react";

export default function Edit() {
    const prev = usePage().props.alumnus;
    const [dirtyDialog, setDirtyDialog] = useState(false);

    const { data, setData, post, processing, errors, isDirty } = useForm({
        surname: prev.surname,
        name: prev.name,
        coorte: prev.coorte,
        status: prev.status
    })

    const submit = (e) => {
        e.preventDefault();
        post(route('registry.edit', { alumnus: prev.id }));
    }

    const checkIfDirty = (e) => {
        e.preventDefault();
        if (isDirty) setDirtyDialog(true);
        else goToRatification();
    }

    const goToRatification = () => {
        Inertia.visit(route('ratifications.add', { alumnus: prev.id }));
    }

    const options = usePage().props.availableStatus.map(i => { return { value: i, label: AlumnusStatus.status[i].label } })

    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <h3>Aggiorna alumno</h3>
            <label>Cognome</label>
            <input type="text" value={data.surname} onChange={(e) => setData('surname', e.target.value)} />
            <label className="error">{errors.surname}</label>
            <label>Nome</label>
            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            <label className="error">{errors.name}</label>
            <label>Coorte</label>
            <input type="number" value={data.coorte} onChange={(e) => setData('coorte', e.target.value)} />
            <label className="error">{errors.coorte}</label>
            <label>Stato</label>
            <Select value={options.find(i => i.value == data.status)} onChange={(sel) => setData('status', sel.value)} options={options} />
            <label className="error">{errors.status}</label>
            <input type="button" className="button mt-4" onClick={submit} value="Aggiorna" />
            <div className="flex flex-row-reverse my-4">
                <button className="button" onClick={checkIfDirty}>Richiedi ratifica</button>
                <label className="grow">Ricorda che alcuni stati non possono essere assegnati direttamente, ma è necessario richiedere una ratifica al consiglio di amministrazione.</label>
                <Dialog open={dirtyDialog}
                    undoLabel="Torna alle modifiche"
                    onClose={() => setDirtyDialog(false)}
                    confirmLabel="Abbandona le modifiche"
                    onConfirm={goToRatification}
                >
                    Ci sono alcune modifiche all'alumno che non hai salvato. Vuoi abbandonarle?
                </Dialog>
            </div>
        </form>
    );
}