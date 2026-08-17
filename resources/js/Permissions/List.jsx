import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import ReactSwitch from "react-switch";
import Dialog from "../Layout/Dialog";
import EmptyDialog from "../Layout/EmptyDialog";
import Backdrop from "../Layout/Backdrop";
import { router } from "@inertiajs/react";
import ResponsiveDrawer from "../Layout/ResponsiveDrawer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUsers, faUsersGear } from "@fortawesome/free-solid-svg-icons";
import { postRequest } from "../Utils";

function RoleCard({role, perms, setProcessing}) {
    const [isDeleting,setIsDeleting] = useState(false);

    const submitDelete = async () => {
        postRequest('roles.delete',
            { name: role.name },
            setProcessing,
            {}, true, true,
            () => {setIsDeleting(false);},
        )
    }

    return <div className="w-full bg-gray-200 rounded-xl p-4" key={role.name}>
        <label>{role.name}</label>
        <div className="flex flex-row items-start">
            <h3>{role.common_name}</h3>
            <h4>{role.can_edit && <div className="icon-button" onClick={() => setIsDeleting(true)}><FontAwesomeIcon icon={faTrash} /></div>}</h4>
        </div>
        <div className="md:columns-2">
            {perms.map(pm => PermissionSwitch(pm, role.permissions_names.includes(pm), role.name, setProcessing))}
        </div>
        <div className="flex flex-row flex-wrap justify-center mt-4 gap-2">
            {role.can_view ? role.identities.map(identity => IdentityChip(identity, setProcessing)) : <label>Non hai il permesso di vedere gli utenti in questo gruppo.</label>}
        </div>
        <Dialog
            open={isDeleting}
            onClose={() => setIsDeleting(false)}
            confirmLabel={"Cancella questo ruolo"}
            undoLabel={"Annulla"}
            onConfirm={submitDelete}>
            Sei sicuro di voler cancellare questo ruolo? Al momento vi sono {role.identities.length} persone con questo ruolo.
        </Dialog>
    </div>
}

function PermissionSwitch(permission, checked, role, setProcessing) {
    return <div className="w-full flex flex-row items-baseline gap-1" key={permission}>
        <ReactSwitch height={14} width={28} checked={checked} onChange={(newState) => onChange(newState, permission, role, setProcessing)} /> {permission}
    </div>
}

function IdentityChip(identity) {
    return <div className="chip" key={identity.id + identity.name}>
        {identity.name} {identity.surname}
    </div>
}

function onChange(state, permission, role, setProcessing) {
    setProcessing(true);
    router.post(
        route('permissions'),
        { role: role, permission: permission, action: state ? 'add' : 'remove' },
        { onFinish: () => { setProcessing(false) }, preserveState: true, preserveScroll: true }
    )
}

function permissionAdd(setProcessing) {
    const { data, setData, errors, post, reset } = useForm({ name: "" });

    const submit = (e) => {
        e.preventDefault()
        setProcessing(true)
        post(route('permissions.add'), { onFinish: () => setProcessing(false), onSuccess: () => reset(), preserveState: true, preserveScroll: true });
    }

    return <form onSubmit={submit} className="w-full flex flex-row items-stretch mt-4">
        <div className="grow">
            <input type="text" className="w-full" placeholder="Aggiungi permesso..." value={data.name} onChange={(e) => setData('name', e.target.value)} />
            <label className="error">{errors.name}</label>
        </div>
        <input type="submit" className="button" value="Aggiungi" />
    </form >
}

function permissionVerify(setProcessing) {


    return <div className="w-full flex flex-row items-stretch mt-4">
        <Link className="button" href={route('permissions.verify')}>Verifica lista permessi</Link>
    </div>
}

export default function List() {
    let roles = usePage().props.roles;
    const perms = usePage().props.perms;
    const [processing, setProcessing] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(-1);

    return <div className="main-container-drawer">
        <Head title="Gestione permessi" />
        <ResponsiveDrawer buttonTitle={selectedIdx >= 0 ? roles[selectedIdx].common_name : "Ruoli"} initiallyOpen={selectedIdx < 0}>
            <ResponsiveDrawer.Drawer>
                {roles.map((role, idx) =>
                    <div
                        className="drawer-item"
                        aria-selected={selectedIdx >= 0 && roles[selectedIdx].name == role.name}
                        onClick={() => setSelectedIdx(idx)}
                        key={role.name}
                    >
                        <FontAwesomeIcon icon={role.is_automatic ? faUsersGear : faUsers } className="mr-2" />
                        {role.common_name}
                    </div>
                )}
                <Link className="drawer-item" href={route('roles.list')} as="div">Gestione ruoli</Link>
            </ResponsiveDrawer.Drawer>
            {selectedIdx >= 0 && <RoleCard role={roles[selectedIdx]} perms={perms} setProcessing={setProcessing} />}
            {permissionAdd(setProcessing)}
            {permissionVerify(setProcessing)}
        </ResponsiveDrawer>
        <Backdrop open={processing} />
    </div>
}