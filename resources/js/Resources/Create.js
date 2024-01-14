import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EmptyDialog from "../Layout/EmptyDialog";
import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import RolesChips from "../Permissions/RolesChips";


export default function Create() {
    const [creating, setIsCreating] = useState(false);
    const roles = usePage().props.roles;

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        canView: [],
        canEdit: []
    })

    const submit = (e) => {
        e.preventDefault();

        post(route('resources.create'), { onSuccess: () => { reset(); setIsCreating(false) } });
    }


    return <>
        <EmptyDialog open={creating} onClose={() => setIsCreating(false)}>
            <h3 className="mb-3">
                Nuova risorsa
            </h3>
            <form onSubmit={submit} className="flex flex-col items-stretch">
                <label>Titolo</label>
                <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                <label className="error">{errors.title}</label>
                <label>Visibile da:</label>
                <RolesChips roles={roles} list={data.canView} updateList={(newList) => setData('canView', newList)} />
                <label className="error">{errors.canView}</label>
                <label>Modificabile da:</label>
                <RolesChips roles={roles} list={data.canEdit} updateList={(newList) => setData('canEdit', newList)} />
                <label className="error">{errors.canEdit}</label>
                <div className="w-full flex flex-row justify-end mt-4 gap-2">
                    <div className='button items-end self-end' onClick={() => setIsCreating(false)}>Annulla</div>
                    <div className='button items-end self-end' onClick={submit}>Salva</div>
                </div>
            </form>
        </EmptyDialog>
        <div className="drawer-item" onClick={() => setIsCreating(true)}>
            <FontAwesomeIcon icon={solid('add')} /> Crea nuova
        </div>
    </>
}