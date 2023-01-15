import { useForm, usePage } from "@inertiajs/inertia-react";
import { AlumnusStatus } from "../Utils";
import Select from 'react-select';

export default function ManuallyAdd() {
    const drivers = usePage().props.drivers.map( i => ({ value: i, label: i}))

    const { data, setData, post, processing, errors } = useForm({
        driver: null,
        credential: ''
    })


    const submit = (e) => {
        console.log( data );
        e.preventDefault();
        post(route('auth.manually_add'));
    }


    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <h3>Crea nuovo metodo di accesso</h3>
            <label>Driver</label>
            <Select value={drivers.find( i => i.value == data.driver)} onChange={(sel) => setData('driver', sel.value)} options={drivers}/>
            <label className="error">{errors.driver}</label>
            <label>Credenziali</label>
            <input type="text" value={data.credential} onChange={(e) => setData('credential', e.target.value)} />
            <label className="error">{errors.credential}</label>
            <input type="button" className="button mt-4" onClick={submit} value="Aggiungi" />
        </form>
    );
}