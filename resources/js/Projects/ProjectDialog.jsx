import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import EmptyDialog from "../Layout/EmptyDialog";

import Backdrop from "../Layout/Backdrop";
import { NurDate, NurDatePicker } from "../Libs/DateEditor";
import ReactSwitch from "react-switch";
import RolesChips from "../Permissions/RolesChips";

export default function ProjectDialog({ toEdit, setToEdit }) {
    const { data, setData, errors, post, transform, processing, reset } = useForm({
        id: null,
        title: "",
        from: new NurDate(),
        to: new NurDate(),
        open: true,
        canView: [],
        canSee: [],
        canApprove: [],
        canEdit: []
    });

    const [creating, setCreating] = useState(false);
    const roles = usePage().props.roles;

    const submit = (e) => {
        e.preventDefault()
        post(route('projects.edit'), { onSuccess: () => { setCreating(false); setToEdit(null) } });
    }

    useEffect(() => {
        if (creating)
            reset();
    }, [creating])

    useEffect(() => {
        if (toEdit)
            setData({
                id: toEdit.id,
                title: toEdit.title,
                from: new NurDate(toEdit.from),
                to: new NurDate(toEdit.to),
                open: toEdit.open,
                canView: toEdit.permissions.filter(p => p.type == 'view').map(p => p.role_id),
                canSee: toEdit.permissions.filter(p => p.type == 'see').map(p => p.role_id),
                canApprove: toEdit.permissions.filter(p => p.type == 'approve').map(p => p.role_id),
                canEdit: toEdit.permissions.filter(p => p.type == 'edit').map(p => p.role_id),
    });
    }, [toEdit])

    return <>
        {usePage().props.canCreate &&
            <div className="button" onClick={() => setCreating(true)}>
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Aggiungi
            </div>
        }
        <EmptyDialog open={creating || toEdit} onClose={() => { setCreating(false); setToEdit(null) }}>
            <form onSubmit={submit} className="w-full flex flex-col items-stretch mt-4 text-black">
                <input type="hidden" value={data.id} />
                <label>Titolo</label>
                <input type="text" className="w-full" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                <label className="error">{errors.title}</label>

                <label>Data inizio progetto</label>
                <NurDatePicker
                    value={data.from}
                    classNames='w-full'
                    onChange={(date) => setData('from', date)} />
                <label className="error">{errors.from}</label>

                <label>Data fine progetto</label>
                <NurDatePicker
                    value={data.to}
                    classNames='w-full'
                    onChange={(date) => setData('to', date)} />
                <label className="error">{errors.to}</label>

                <label>Disponibile per la richiesta di rimborsi</label>
                <ReactSwitch height={21} width={42} className="m-2"
                    checked={data.open} onChange={(newState) => setData('open', newState)}
                />
                <label className="error">{errors.open}</label>

                <label>Possono inserire richieste di rimborso:</label>
                <RolesChips roles={roles} list={data.canView} updateList={(newList) => setData('canView', newList)} small />
                <label className="error">{errors.canView}</label>

                <label>Possono vedere le richieste di rimborso altrui:</label>
                <RolesChips roles={roles} list={data.canSee} updateList={(newList) => setData('canSee', newList)} small />
                <label className="error">{errors.canSee}</label>
                
                <label>Possono approvare le richieste di rimborso:</label>
                <RolesChips roles={roles} list={data.canApprove} updateList={(newList) => setData('canApprove', newList)} small />
                <label className="error">{errors.canApprove}</label>
                
                <label>Possono modificare il progetto:</label>
                <RolesChips roles={roles} list={data.canEdit} updateList={(newList) => setData('canEdit', newList)} small />
                <label className="error">{errors.canEdit}</label>

                <input type="submit" className="button" value="Salva progetto" />

                <Backdrop open={processing} />
            </form>
        </EmptyDialog>
    </>
}