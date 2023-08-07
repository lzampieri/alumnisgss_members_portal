import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { AlumnusStatus } from "../Utils";
import Dialog from '../Layout/Dialog';
import { router } from "@inertiajs/react";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function DetailRow({ data, setData, options, errors, errors_prename }) {
    return <><div className={"w-full flex flex-row my-1 gap-1 items-center " + (data.delete ? "text-error line-through	" : "")}>
        <CreatableSelect className="basis-0 grow" value={ { value: data.key, label: data.key } } onChange={(e) => setData('key', e.value ) } options={options} />
        <input className="basis-0 grow" type="text" value={data.value} onChange={(e) => setData('value', e.target.value)} />
        <button className={"icon-button h-8 w-8 grow-0 " + (data.delete ? "button-active" : "")} onClick={(e) => { e.preventDefault(); setData('delete', !data.delete) }}>
            <FontAwesomeIcon icon={solid('trash')} />
        </button>
    </div>
    <label className="error">{errors[errors_prename+"key"]}</label>
    <label className="error">{errors[errors_prename+"value"]}</label>
    <label className="error">{errors[errors_prename+"delete"]}</label>
    </>
}

export default function Edit() {
    const prev = usePage().props.alumnus;
    const [dirtyDialog, setDirtyDialog] = useState(false);

    const { data, setData, post, processing, errors, isDirty } = useForm({
        surname: prev?.surname || '',
        name: prev?.name || '',
        coorte: prev?.coorte || 1,
        status: prev?.status || 'not_reached',
        tags: prev?.tags || [],
        details: prev?.details || []
    })

    const submit = (e) => {
        e.preventDefault();
        post(route('registry.edit', { alumnus: prev?.id }));
    }

    const checkIfDirty = (e) => {
        e.preventDefault();
        if (isDirty) setDirtyDialog(true);
        else goToRatification();
    }

    const goToRatification = () => {
        Inertia.visit(route('ratifications.add', { alumnus: prev.id }));
    }

    const status_options = usePage().props.availableStatus.map(i => { return { value: i, label: AlumnusStatus.status[i].label } })
    const opt_arrs = ( tags ) => tags.map(i => { return { value: i, label: i } })
    const tags_options = opt_arrs( usePage().props.allTags || [] )
    const details_options = opt_arrs( usePage().props.allDetails || [] )

    const updateDetails = ( idx, key, value ) => {
        let newDetails = data.details.slice();
        newDetails[idx][key] = value;
        setData('details', newDetails);
    }
    const addDetails = () => {
        let newDetails = data.details.slice();
        newDetails.push({ key: '', value: '' });
        setData('details', newDetails);
    }

    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <h3>{ prev ? "Aggiorna" : "Crea nuovo"} alumno</h3>

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
            <Select value={status_options.find(i => i.value == data.status)} onChange={(sel) => setData('status', sel.value)} options={status_options} />
            <label className="error">{errors.status}</label>
            
            <label>Tags</label>
            <CreatableSelect isMulti value={ opt_arrs( data.tags ) } onChange={(newValue) => setData('tags', newValue.map( i => i.value ) ) } options={tags_options} />
            <label className="error">{errors.tags}</label>
            
            <label>Altri dettagli</label>
            <label className="error">{errors.details}</label>
            { data.details.map( (det, idx) => 
                <DetailRow
                    key={idx}
                    data={det}
                    setData={(k, v) => updateDetails(idx,k,v)}
                    options={details_options}
                    errors={errors}
                    errors_prename={"details."+idx+"."}
                    />
            )}
            <button className="icon-button h-8 w-8 grow-0" onClick={(e) => { e.preventDefault(); addDetails() }}>
                <FontAwesomeIcon icon={solid('circle-plus')} />
            </button>
            
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