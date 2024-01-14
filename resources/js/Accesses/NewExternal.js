import { useForm, usePage } from "@inertiajs/react";
import Select from 'react-select';

export default function NewExternal({ lmth }) {

    const { data, setData, post, processing, errors } = useForm({
        surname: '',
        name: '',
        notes: ''
    })

    const submit = (e) => {
        e.preventDefault();
        if (lmth)
            post(route('externals.add_and_associate', { lmth: lmth.id }));
        // else
        //     post( route( 'externals.add_and_associate', { lmth: lmth.id } ) );
    }


    return (
        <form className="flex flex-col mx-2" onSubmit={submit}>
            <label>Cognome</label>
            <input type="text" value={data.surname} onChange={(e) => setData('surname', e.target.value)} />
            <label className="error">{errors.surname}</label>
            <label>Nome</label>
            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            <label className="error">{errors.name}</label>
            <label>Note (ad esempio, il motivo per cui ha un rapporto con l'associazione)</label>
            <input type="text" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
            <label className="error">{errors.notes}</label>
            <input type="button" className="button mt-4" onClick={submit} value="Salva, associa ed abilita" />
        </form>
    );
}