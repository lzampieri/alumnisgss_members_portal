import { useForm, usePage } from "@inertiajs/react";
import { AlumnusStatus } from "../Utils";
import Select from 'react-select';
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

export default function ImportDetails() {
    const output = usePage().props.flash || "Nessuna modifica eseguita";

    const { data, setData, post, processing, errors } = useForm({
        file: ''
    })

    const submit = (e) => {
        e.preventDefault();
        post( route('registry.impexp.import.xls_details') );
    }

    return (
        <div className="main-container">
            <div className="w-full flex flex-col justify-start items-start gap-2">
                <h3>Import database</h3>
                Attraverso questa pagina è possibile importare il database degli alumni da un file excel. <br/>
                Il file deve essere precedentemente scaricato da questo stesso portale; operate le modifiche, lo si può quindi ricaricare e le differenze verranno individuate e salvate.<br/>
                Si preferisca sempre la modifica direttamente sul portale, uno per uno, dei dati; si utilizzi questa funzionalità solo quando il numero di modifiche da apportare sia tale da rendere disagevole la procedura.<br/>
                <span className="text-error">Tramite questa funzionalità non è possibile creare o eliminare alumni. Eventuali righe nuove o mancanti nel file caricato saranno ignorate.</span>
                <a className="button" href={route('registry.impexp.export.xls_details')}>
                    <FontAwesomeIcon icon={solid('download')} />
                    Scarica file da modificare
                </a>
                <form>
                    <input type="file" onChange={e => setData('file', e.target.files[0])} accept=".xlsx" />
                    <button type="submit" className="button mx-4" onClick={submit}>
                        <FontAwesomeIcon icon={solid('folder-plus')} /> Importa
                    </button>
                </form>
                <label className="error">{errors.file}</label>
                <pre>
                    {output}
                </pre>
            </div>
            <Backdrop open={processing} />
        </div>
    );
}