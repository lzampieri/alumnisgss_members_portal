import { useForm, usePage } from "@inertiajs/inertia-react";
import { AlumnusStatus } from "../Utils";
import Select from 'react-select';

export default function Add() {
    const options = usePage().props.availableStatus.map( i => { return { value: i, label: AlumnusStatus.status[ i ].label } } )

    const { data, setData, post, processing, errors } = useForm({
        surname: '',
        name: '',
        coorte: 1,
        status: 'not_reached'
    })


    const submit = ( e ) => {
        e.preventDefault();
        post( route( 'registry.add' ) );
    }


    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={ submit }>
            <h3>Crea nuovo alumno</h3>
            <label>Cognome</label>
            <input type="text" value={ data.surname } onChange={ ( e ) => setData( 'surname', e.target.value ) } />
            <label className="error">{ errors.surname }</label>
            <label>Nome</label>
            <input type="text" value={ data.name } onChange={ ( e ) => setData( 'name', e.target.value ) } />
            <label className="error">{ errors.name }</label>
            <label>Coorte</label>
            <input type="number" value={ data.coorte } onChange={ ( e ) => setData( 'coorte', e.target.value ) } />
            <label className="error">{ errors.coorte }</label>
            <label>Stato</label>
            <Select value={ options.find( i => i.value == data.status ) } onChange={ ( sel ) => setData( 'status', sel.value ) } options={ options } />
            <label className="">Ricorda che alcuni stati non possono essere assegnati direttamente, ma è necessario richiedere una ratifica dopo aver creato l'identità.</label>
            <label className="error">{ errors.status }</label>
            <input type="button" className="button mt-4" onClick={ submit } value="Aggiungi" />
        </form>
    );
}