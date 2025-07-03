import { Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";


export default function AskAccess() {
    const [accessRequest, setAccessRequest] = useState(false);
    const [lines, setLines] = useState(5);
    const email = usePage().props.email;
    const { data, setData, processing, errors, post } = useForm({
        comment: 'Carissimi\nSono NOME COGNOME e richiedo l\'accesso al presente portale soci per SCOPO.\nCordialmente,',
        address: email
    })

    const submit = (e) => {
        e.preventDefault();
        post(route('auth.askaccess'));
    }

    const setComment = (e) => {
        setData('comment', e.target.value);
        setLines(e.target.value.split(/\r\n|\r|\n/).length + 5);
    }

    return (
        <div className="main-container !items-start">
            <h3>Primo accesso</h3>
            È la prima volta che viene rilevato un accesso a questo portale con queste credenziali.<br />
            <br />
            <b>Se hai sbagliato credenziali</b>
            <a href={route('auth.login.google')} className="button">Rifai l'accesso</a><br />
            <b>Se vuoi visualizzare solo la parte pubblica del portale</b>
            <Link href={route('home')} className="button">Torna alla home</Link><br />
            <b>Se sei un aspirante socio</b>
            Iscriviti all'associazione compilando il modulo dedicato; non appena la tua richiesta sarà registrata, ti sarà attivato l'accesso al portale!
            <Link href={route('permalink', {permalink: 'diventa-socio'})} className="button">Vai al modulo</Link><br />
            <b>Se sei un socio (ordinario, studente o preiscritto) o se hai qualche collaborazione con la scuola</b>
            <a onClick={(e) => { e.preventDefault(); setAccessRequest(true); }} className="button" style={{ display: accessRequest ? 'none' : 'block' }}>Richiedi l'accesso</a>
            <form onSubmit={submit} className="flex-col w-full" style={{ display: accessRequest ? 'flex' : 'none' }}>
                <label>L'accesso verrà richiesto per {data.address}</label>
                <label className="error">{errors.address}</label>
                <label>È possibile lasciare un messaggio per la segreteria</label>
                <label className="error">{errors.comment}</label>
                <textarea className="textarea-container" rows={lines} value={data.comment} onChange={setComment} />
                <input type="submit" className="button" value="Invia richiesta" onClick={submit} />
            </form>
        </div>
    )
}