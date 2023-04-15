import { Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import ReactSwitch from "react-switch";
import { Roles } from "../Utils";
import Backdrop from "../Layout/Backdrop";
import { router } from "@inertiajs/react";
import ResponsiveDrawer from "../Layout/ResponsiveDrawer";
import EmptyDialog from "../Layout/EmptyDialog";

function RoleCard(role, perms, setProcessing) {
    return <div className="w-full bg-gray-200 rounded-xl p-4" key={role.name}>
        <label>{role.name}</label>
        <h3>{role.common_name}</h3>
        <div className="md:columns-2">
            {perms.map(pm => PermissionSwitch(pm, role.permissions_names.includes(pm), role.name, setProcessing))}
        </div>
        <div className="flex flex-row flex-wrap justify-center mt-4 gap-2">
            {role.identities.map(identity => IdentityChip(identity, setProcessing))}
        </div>
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

function roleAdd(setProcessing) {
    const { data, setData, errors, post, reset } = useForm({ name: "", common_name: "" });
    const [open, setOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault()
        setProcessing(true)
        post(route('roles.add'), { onFinish: () => setProcessing(false), onSuccess: () => { reset(), setOpen(false) }, preserveState: true, preserveScroll: true });
    }

    return <div className="drawer-item" onClick={() => setOpen(true)} key={-1}>
        + Aggiungi
        <EmptyDialog open={open} onClose={() => setOpen(false)}>
            <form onSubmit={(e) => submit(e)} className="w-full flex flex-col items-stretch mt-4 text-black">
                <label>Nome software</label>
                <input type="text" className="w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                <label className="error">{errors.name}</label>
                <label>Nome comune</label>
                <input type="text" className="w-full" value={data.common_name} onChange={(e) => setData('common_name', e.target.value)} />
                <label className="error">{errors.common_name}</label>
                <input type="submit" className="button" value="Aggiungi ruolo" />
            </form >
        </EmptyDialog>
    </div>
}

export default function List() {
    let roles = usePage().props.roles;
    const perms = usePage().props.perms;
    const [processing, setProcessing] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(-1);

    return <div className="main-container-drawer">
        <ResponsiveDrawer buttonTitle={selectedIdx >= 0 ? roles[selectedIdx].common_name : "Ruoli"} initiallyOpen={selectedIdx < 0}>
            <ResponsiveDrawer.Drawer>
                {roles.map((role, idx) =>
                    <div
                        className="drawer-item"
                        aria-selected={selectedIdx >= 0 && roles[selectedIdx].name == role.name}
                        onClick={() => setSelectedIdx(idx)}
                        key={role.name}
                    >
                        {role.common_name}
                    </div>
                )}
                {roleAdd(setProcessing)}
            </ResponsiveDrawer.Drawer>
            {selectedIdx >= 0 && RoleCard(roles[selectedIdx], perms, setProcessing)}
            {permissionAdd(setProcessing)}
        </ResponsiveDrawer>
        <Backdrop open={processing} />
    </div>
}