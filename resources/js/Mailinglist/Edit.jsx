import { Head, useForm, usePage } from "@inertiajs/react";


import { enqueueSnackbar } from "notistack";
import { faDownload, faFolderPlus, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Backdrop from "../Layout/Backdrop";
import TextareaAutosize from 'react-textarea-autosize';

export default function Edit() {
    const prev = usePage().props.mailinglist;
    const roles = usePage().props.roles;

    const { data, setData, post, processing, errors, transform } = useForm({
        name: prev?.name || '',
        list: null,
        canView: prev?.dynamic_permissions?.filter(dp => dp.type == 'view').map(dp => dp.role_id) || [],
        canEdit: prev?.dynamic_permissions?.filter(dp => dp.type == 'edit').map(dp => dp.role_id) || []
    })

    const submit = (e) => {
        e.preventDefault();
        post(
            route('mailinglist.edit', { ml: prev?.id }), {
            preserveState: "errors",
            onError: () => enqueueSnackbar('C\'è stato un errore, verifica tutti i campi', { variant: 'error' })
        });
    }

    const changeViewRole = (id) => {
        if (data.canView.includes(id)) {
            data.canView.splice(data.canView.indexOf(id), 1)
            setData('canView', data.canView.slice())
        } else
            setData('canView', data.canView.concat([id]))
    }
    const changeEditRole = (id) => {
        if (data.canEdit.includes(id)) {
            data.canEdit.splice(data.canEdit.indexOf(id), 1)
            setData('canEdit', data.canEdit.slice())
        } else
            setData('canEdit', data.canEdit.concat([id]))
    }

    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <Head title={prev ? prev.name : "Nuova mailing list"} />
            <div className="w-full justify-between flex flex-row">
                <h3>{prev ? "Aggiorna" : "Crea nuova"} mailing list</h3>
                <div className="button flex flex-row items-center" onClick={submit}>
                    <FontAwesomeIcon icon={faSave} />
                    Salva
                </div>
            </div>

            <label>Nome</label>
            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            <label className="error">{errors.name}</label>

            <label>Visibile da</label>
            <div className="w-full flex flex-row flex-wrap justify-start gap-y-2">
                {roles.map(r =>
                    <div key={r.id} className="chip px-4 py-2 cursor-pointer aria-disabled:opacity-40" aria-disabled={!data.canView.includes(r.id)} onClick={() => changeViewRole(r.id)}>
                        {r.common_name}
                    </div>)}
            </div>
            <label className="error">{errors.canView}</label>

            <label>Modificabile da</label>
            <div className="w-full flex flex-row flex-wrap justify-start gap-y-2">
                {roles.map(r =>
                    <div key={r.id} className="chip px-4 py-2 cursor-pointer aria-disabled:opacity-40" aria-disabled={!data.canEdit.includes(r.id)} onClick={() => changeEditRole(r.id)}>
                        {r.common_name}
                    </div>)}
            </div>
            <label className="error">{errors.canEdit}</label>

            <div className="button flex flex-row items-center self-end my-4" onClick={submit}>
                <FontAwesomeIcon icon={faSave} />
                Salva
            </div>

            <label>Indirizzi</label>
            <a href={route('mailinglist.download', { ml: prev?.id })} target="_blank" className="button my-2 self-start">
                <FontAwesomeIcon icon={faDownload} /> Scarica lista
            </a>
            <input type="file" onChange={e => setData('list', e.target.files[0])} accept=".xlsx" placeholder="Carica nuova lista..."/>
            <label className="error">{errors.list}</label>

            <div className="button flex flex-row items-center self-end my-4" onClick={submit}>
                <FontAwesomeIcon icon={faSave} />
                Salva
            </div>

            <Backdrop open={processing} />
        </form>
    );
}