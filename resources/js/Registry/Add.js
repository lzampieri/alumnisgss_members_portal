import { useForm } from "@inertiajs/inertia-react";
import { AlumnusStatus } from "../Utils";
import Select from 'react-select';

export default function Add() {
    const { data, setData, post, processing, errors } = useForm({
        surname: '',
        name: '',
        coorte: 1,
        status: 0
    })

    const submit = ( e ) => {
        e.preventDefault();
        post( route( 'registry.add' ) );
    }

    const options = AlumnusStatus.names.map( (v,i) => { return { value: i, label: v } } )

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
            <Select value={ options[ data.status ] } onChange={ ( sel ) => setData( 'status', sel.value ) } options={ options } />
            <label className="error">{ errors.status }</label>
            <input type="button" className="button mt-4" onClick={ submit } value="Aggiungi" />
        </form>
    );
}