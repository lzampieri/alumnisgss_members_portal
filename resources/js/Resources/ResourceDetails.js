import { useState } from "react";
import BlocksEditor from "../Blocks/BlocksEditor";
import BlocksViewer from "../Blocks/BlocksViewer";
import { Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import EmptyDialog from "../Layout/EmptyDialog";
import RolesChips from "../Permissions/RolesChips";
import { postRequest } from "../Utils";
import Backdrop from "../Layout/Backdrop";

function EditRoles({ type, initialList, resourceId, setProcessing }) {
    if (!(type == 'view' || type == 'edit'))
        return;

    const roles = usePage().props.roles;
    const [dialog, openDialog] = useState(false);
    const [currentList, updateList] = useState(initialList);

    const save = () => {
        openDialog(false);

        if (initialList.sort() + "" == currentList.sort() + "") {
            return;
        }

        postRequest(
            'resources.updatePermissions',
            { type: type, newList: currentList, resourceId: resourceId },
            setProcessing
        )
    }

    return <>
        <FontAwesomeIcon icon={solid('pencil')} className="icon-button mx-3" onClick={() => openDialog(true)} />
        <EmptyDialog open={dialog} onClose={() => openDialog(false)}>
            <h3 className="mb-3">
                {type == 'view' && "Visibile da:"}
                {type == 'edit' && "Modificabile da:"}
            </h3>
            <RolesChips roles={roles} list={currentList} updateList={updateList} />
            <div className='button items-end self-end' onClick={save}>Salva</div>
        </EmptyDialog>
    </>
}

function AddPermalink({ resourceId }) {
    const [dialog, openDialog] = useState(false);
    const { data, setData, processing, errors, post } = useForm({
        resourceId: resourceId,
        link: ''
    })

    const submit = (e) => {
        e.preventDefault();
        post(route('resources.addPermalink'), { onSuccess: openDialog( false ) });
    }

    const setLink = ( new_link ) => {
        setData('link', new_link.replace(/[^0-9a-zA-Z_-]/g,'') );   
    }

    return <>
        <FontAwesomeIcon icon={solid('ADD')} className="icon-button mx-3" onClick={() => openDialog(true)} />
        <EmptyDialog open={dialog} onClose={() => openDialog(false)}>
            <form onSubmit={submit} className="flex flex-col w-full items-start">
                <h3 className="mb-3">
                    Aggiungi permalink:
                </h3>
                <div className="text-error text-sm">Attenzione: l'aggiunta di permalink è permanente. Una volta aggiunto, un permalink non potrà essere rimosso o modificato.</div>
                <input className="w-full my-2" type="text" maxLength={125} id="link" name="link" value={data.link} onChange={(e) => setLink(e.target.value)} />
                <label className="error">{ errors.link }</label>
                <div className='button self-end' onClick={submit}>Salva</div>
            </form>
        </EmptyDialog>
        <Backdrop open={processing} />
    </>
}

function Content({ resource, setProcessing }) {
    const [isEditing, setIsEditing] = useState(false) // todo set false

    const save = (newContent) => {
        setIsEditing(false)

        postRequest(
            'resources.updateContent',
            { content: JSON.stringify(newContent), resourceId: resource.id },
            setProcessing
        )
    }

    return <>
        {resource.canEdit && !isEditing && <div className='button items-end self-end' onClick={() => setIsEditing(true)}><FontAwesomeIcon icon={solid('pencil')} className="" />Modifica</div>}
        {isEditing ?
            <BlocksEditor initialContent={JSON.parse(resource.content)} saveCallback={save} /> :
            <BlocksViewer content={JSON.parse(resource.content)} />}
        {resource.canEdit && <Delete resource={resource} setProcessing={setProcessing} />}
    </>

}

function Delete({ resource, setProcessing }) {
    const [deleting, setIsDeleting] = useState(false);

    const deletingPost = () => {
        setIsDeleting(false);

        postRequest(
            'resources.delete',
            { resourceId: resource.id },
            setProcessing,
            {},
            false
        )
    }

    return <>
        <div className='button items-end self-end' onClick={() => setIsDeleting(true)}><FontAwesomeIcon icon={solid('trash')} />Elimina</div>
        <EmptyDialog open={deleting} onClose={() => setIsDeleting(false)}>
            <h3 className="mb-3">
                Attenzione!
            </h3>
            <span>Sei sicuro di voler eliminare la risorsa <i>{resource.title}</i>? Questa azione è irreversibile.</span>
            <div className="w-full flex flex-row justify-end my-2 gap-2">
                <div className='button items-end self-end' onClick={() => setIsDeleting(false)}>Annulla</div>
                <div className='button items-end self-end' onClick={deletingPost}>Conferma</div>
            </div>
        </EmptyDialog>
    </>
}

export default function ResourceDetails({ resource }) {
    const [processing, setProcessing] = useState(false);

    const canView = resource.dynamic_permissions.filter(dp => dp.type == 'view').map(dp => dp.role)
    const canEdit = resource.dynamic_permissions.filter(dp => dp.type == 'edit').map(dp => dp.role)
    const hasPermalinks = resource?.permalinks?.length

    return <div className="flex flex-col w-full items-start">
        <h3>{resource.title}</h3>
        <div className="text-sm text-gray-400">
            Visibile da {canView.map(r => r.common_name).join(", ")}
            {resource.canEdit && <EditRoles type="view" initialList={canView.map(r => r.id)} resourceId={resource.id} setProcessing={setProcessing} />}
        </div>
        <div className="text-sm text-gray-400">
            Modificabile da {canEdit.map(r => r.common_name).join(", ")}
            {resource.canEdit && <EditRoles type="edit" initialList={canEdit.map(r => r.id)} resourceId={resource.id} setProcessing={setProcessing} />}
        </div>
        <div className="text-sm text-gray-400">
            {hasPermalinks ? <>
                Permalinks: {resource.permalinks.map(i => <Link href={route('permalink', {'permalink': i.id})} key={i.id}>{i.id}</Link>).reduce((prev,curr) => [prev, ', ',curr])}
            </> : <>
                { resource.canEdit && "Nessun permalink assegnato" }
            </>}
            {resource.canEdit && <AddPermalink resourceId={resource.id} setProcessing={setProcessing} />}
        </div>
        <Content resource={resource} setProcessing={setProcessing} />
        <Backdrop open={processing} />
    </div>
}