import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import ReactSwitch from "react-switch";
import Dialog from "../Layout/Dialog";
import EmptyDialog from "../Layout/EmptyDialog";
import Backdrop from "../Layout/Backdrop";
import Select, { createFilter } from 'react-select';
import { router } from "@inertiajs/react";
import ResponsiveDrawer from "../Layout/ResponsiveDrawer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faUsers, faUsersGear, faX } from "@fortawesome/free-solid-svg-icons";
import { postRequest, romanize } from "../Utils";
import RolesChips from "../Permissions/RolesChips";
import Create from "./Create";

function RoleCard({ role, setProcessing }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [identityDeleting, setIdentityDeleting] = useState(null);
    const people = usePage().props.people || [];

    const submitDelete = async () => {
        postRequest('roles.delete',
            { name: role.name },
            setProcessing,
            {}, false, false, () =>
                router.visit( route('roles.list') )
        )
    }
    const submitIdentityDelete = async () => {
        postRequest(
            'roles.remove',
            { identity: identityDeleting.id, type: identityDeleting.status ? 'alumnus' : 'external', role: role.id },
            setProcessing,
            {},
            false, false
        );
    }
    const submitIdentityAdd = async (identity) => {
        postRequest(
            'roles.add',
            { identity: identity.id, type: identity.status ? 'alumnus' : 'external', role: role.id },
            setProcessing,
            {},
            false, false
        );
    }

    const canView = role.permissable_via_dynamic_permissions.filter(dp => dp.role != null).filter(dp => dp.type == 'view').map(dp => dp.role)
    const canEdit = role.permissable_via_dynamic_permissions.filter(dp => dp.role != null).filter(dp => dp.type == 'edit').map(dp => dp.role)

    return <div className="w-full p-4" key={role.name}>
        <label>{role.name}</label>
        <div className="flex flex-row items-start">
            <h3>{role.common_name}</h3>
            <h4>{role.can_edit && <div className="icon-button" onClick={() => setIsDeleting(true)}><FontAwesomeIcon icon={faTrash} /></div>}</h4>
        </div>
        <div className="text-sm text-gray-400">
            Visibile da {canView.map(r => r.common_name).join(", ")}
            {role.can_edit && <EditRoles type="view" initialList={canView.map(r => r.id)} role={role} setProcessing={setProcessing} />}
        </div>
        <div className="text-sm text-gray-400">
            Modificabile da {canEdit.map(r => r.common_name).join(", ")}
            {role.can_edit && <EditRoles type="edit" initialList={canEdit.map(r => r.id)} role={role} setProcessing={setProcessing} />}
        </div>
        {!role.can_view && <div className="text-primary-main">Non hai il permesso di vedere i componenti di questo gruppo</div>}
        {!role.can_edit && <div className="text-primary-main">Non hai il permesso di modificare i componenti di questo gruppo</div>}
        {role.can_view && <div className="flex flex-col justify-start items-start mt-4 gap-2">
            {role.identities.map(identity => <IdentityChip identity={identity} setIsDeleting={setIdentityDeleting} key={identity.id} canEdit={role.can_edit} />)}
        </div>}
        {role.can_edit &&
            <Select
                className="my-2"
                classNames={{ control: () => 'selectDropdown' }}
                isSearchable={true}
                getOptionValue={(option) => option.id }
                getOptionLabel={(option) => <span><IdentityName identity={option} /></span>}
                filterOption={createFilter({ stringify: option => option.data.surname + " " + option.data.name + " " + option.data.coorte + " " + romanize(option.data.coorte) + " " + option.data.note })}
                options={people}
                placeholder="Aggiungi..."
                onChange={(sels) => submitIdentityAdd( sels )} />}
        <Dialog
            open={isDeleting}
            onClose={() => setIsDeleting(false)}
            confirmLabel={"Cancella questo ruolo"}
            undoLabel={"Annulla"}
            onConfirm={submitDelete}>
            Sei sicuro di voler cancellare questo ruolo? Al momento vi sono {role?.identities?.length} persone con questo ruolo.
        </Dialog>
        <Dialog
            open={identityDeleting}
            onClose={() => setIdentityDeleting(null)}
            confirmLabel={"Rimuovi"}
            undoLabel={"Annulla"}
            onConfirm={submitIdentityDelete}>
            Sei sicuro di voler rimuovere <IdentityName identity={identityDeleting} /> dal gruppo {role.common_name}?
        </Dialog>
    </div>
}

function EditRoles({ type, initialList, role, setProcessing }) {
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
            'roles.updatePermissions',
            { type: type, newList: currentList, roleId: role.id },
            setProcessing
        )
    }

    return <>
        <FontAwesomeIcon icon={faPencil} className="icon-button mx-3" onClick={() => openDialog(true)} />
        <EmptyDialog open={dialog} onClose={() => openDialog(false)}>
            <label className="mb-3">
                {type == 'view' && "Visibile da:"}
                {type == 'edit' && "Modificabile da:"}
            </label>
            <RolesChips roles={roles} list={currentList} updateList={updateList} />
            <div className='button items-end self-end mt-2' onClick={save}>Salva</div>
        </EmptyDialog>
    </>
}

function IdentityChip({ identity, setIsDeleting, canEdit }) {
    return <div className="flex flex-row rounded bg-gray-200 max-w-full" style={{ overflowWrap: "anywhere" }}>
        <div className="p-1 pl-2">
            <IdentityName identity={identity} />
        </div>
        {canEdit && <div role="button" className="flex flex-row items-center hover:bg-[#FFBDAD] hover:text-[#DE350B] px-2"
            onClick={() => setIsDeleting(identity)}>
            <FontAwesomeIcon icon={faX} className="text-[0.5rem]" />
        </div>}
    </div>
}

function IdentityName({ identity }) {
    if (identity)
        return <>{identity.name} {identity.surname} <span className="text-gray-400">{identity.coorte ? romanize(identity.coorte) : identity.notes}</span></>
    return "";
}

export default function List() {
    let roles = usePage().props.roles;
    let role = usePage().props.role;
    const [processing, setProcessing] = useState(false);

    return <div className="main-container-drawer">
        <Head title="Gestione gruppi" />
        <ResponsiveDrawer buttonTitle={role ? role.common_name : "Gruppi"} initiallyOpen={!role}>
            <ResponsiveDrawer.Drawer>
                {roles.map((rr, idx) =>
                    <Link
                        className="drawer-item"
                        as="div"
                        aria-selected={role && role.name == rr.name}
                        href={route('roles.role', { role: rr.id })}
                        key={rr.id}
                    >
                        <FontAwesomeIcon icon={rr.is_automatic ? faUsersGear : faUsers} className="mr-2" />
                        {rr.common_name}
                    </Link>
                )}
                { usePage().props.canCreate && <Create /> }
            </ResponsiveDrawer.Drawer>
            {role && <RoleCard role={role} setProcessing={setProcessing} />}
        </ResponsiveDrawer>
        <Backdrop open={processing} />
    </div>
}