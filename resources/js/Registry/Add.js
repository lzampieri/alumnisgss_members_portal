import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useForm } from "@inertiajs/inertia-react";


export default function List() {
    const { data, setData, post, processing, errors } = useForm({
        surname: '',
        name: '',
        coorte: 1,
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
            <input type="button" className="button mt-4" onClick={ submit } value="Aggiungi" />
        </form>
    );
}