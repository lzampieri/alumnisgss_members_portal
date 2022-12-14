import { useForm, usePage } from "@inertiajs/inertia-react";
import { Documents } from "../Utils";
import IdSelector from "./IdSelector";
import Datepicker from "tailwind-datepicker-react"
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";

export default function Upload() {
    const privacies = usePage().props.privacies;

    const { data, setData, post, processing, errors, progress } = useForm({
        privacy: privacies[0],
        identifier: '',
        date: new Date(),
        prehandle: '',
        note: '',
        file: ''
    })

    const [datePickerOpen,setDatePickerOpen] = useState(false);

    const submit = ( e ) => {
        e.preventDefault();

        data.prehandle = data.date.toLocaleDateString('it-IT', {'year': 'numeric'});
        let months = ['A', 'B', 'C', 'D', 'E', 'H', 'L', 'M', 'P', 'R', 'S', 'T'];
        data.prehandle = data.prehandle + months[ data.date.toLocaleDateString('it-IT', {'month': 'numeric'}) - 1 ];

        post( route( 'board.add' ) );
    }


    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={ submit }>
            <h3>Carica documento</h3>
            { !usePage().props.canEdit && <label className="error">Attenzione: possiedi i permessi di caricare documenti, ma non di modificare documenti già caricati. Rivedi con attenzione tutti i campi prima di salvare.</label> }
            <label>Identificativo</label>
            <IdSelector onChange={ (idf) => setData('identifier', idf ) } />
            <label className="error">{ errors.identifier }</label>
            <label>Visibilità</label>
            <div className="w-full flex flex-row flex-wrap justify-start">
                { privacies.map( p =>
                <div key={p} className={"chip px-4 py-2 cursor-pointer " + ( p == data.privacy ? '' : 'disabled' )} onClick={() => setData('privacy',p)}>
                    { Documents.names[p] || p }
                </div> )}
            </div>
            <label className="error">{ errors.privacy }</label>
            <label>Data di redazione</label>
            <Datepicker classNames='w-full' options={{ maxDate: new Date(), language: 'it', theme: { input: '!text-black' } }} onChange={(date) => setData('date',date)} show={datePickerOpen} setShow={setDatePickerOpen} />
            <label className="error">{ errors.date }</label>
            <label>Note</label>
            <input type="text" value={ data.note } onChange={ ( e ) => setData( 'note', e.target.value ) } />
            <label className="error">{ errors.note }</label>
            <label>File</label>
            <input type="file" onChange={e => setData('file', e.target.files[0])} accept=".pdf" />
            <label className="error">{ errors.file }</label>
            <input type="button" className="button mt-4" onClick={ submit } value="Aggiungi" />
            <Backdrop open={processing} />
        </form>
    );
}