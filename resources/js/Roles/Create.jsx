import EmptyDialog from "../Layout/EmptyDialog";
import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import RolesChips from "../Permissions/RolesChips";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Backdrop from "../Layout/Backdrop";


export default function Create() {
    const [creating, setIsCreating] = useState(false);
    const roles = usePage().props.roles;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        common_name: '',
        canView: [],
        canEdit: [],
    })

    const submit = (e) => {
        e.preventDefault();

        post(route('roles.create'), { onSuccess: () => { reset(); setIsCreating(false) } });
    }

    return <>
        <EmptyDialog open={creating} onClose={() => setIsCreating(false)}>
            <h3 className="mb-3">
                Nuovo gruppo
            </h3>
            <form onSubmit={submit} className="flex flex-col items-stretch">
                <label>Nome software</label>
                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                <label className="error">{errors.name}</label>
                <label>Nome comune</label>
                <input type="text" value={data.common_name} onChange={(e) => setData('common_name', e.target.value)} />
                <label className="error">{errors.common_name}</label>
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
            <FontAwesomeIcon icon={faAdd} /> Crea nuovo
        </div>
        <Backdrop open={processing} />
    </>
}