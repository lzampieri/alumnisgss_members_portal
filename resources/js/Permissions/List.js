import { Link, useForm, usePage } from "@inertiajs/inertia-react";
import { useState } from "react";
import ReactSwitch from "react-switch";
import { Roles } from "../Utils";
import Backdrop from "../Layout/Backdrop";
import { Inertia } from "@inertiajs/inertia";

function RoleCard( role, perms, setProcessing ) {
    return <div className="w-2/5 bg-gray-200 rounded-xl p-4" key={role.name}>
        <label>{ role.name }</label>
        <h3>{ Roles.names[ role.name ] }</h3>
        { perms.map( pm => PermissionSwitch( pm, role.permissions_names.includes( pm ), role.name, setProcessing ) ) }
    </div>
}

function PermissionSwitch( permission, checked, role, setProcessing ) {
    return <div className="w-full flex flex-row items-baseline gap-1" key={permission}>
        <ReactSwitch height={14} width={28} checked={checked} onChange={(newState) => onChange(newState,permission,role,setProcessing)} /> {permission}
    </div>
}

function onChange( state, permission, role, setProcessing ) {
    setProcessing(true);
    Inertia.post(
        route('permissions'),
        { role: role, permission: permission, action: state ? 'add' : 'remove' },
        { onFinish: () => { setProcessing(false) }, preserveState: true, preserveScroll: true }
    )
}

function permissionAdd( setProcessing ) {
    const { data, setData, errors, post, reset } = useForm({name: ""});

    const submit = (e) => {
        e.preventDefault()
        setProcessing( true )
        post( route('permissions.add'),{ onFinish: () => setProcessing( false ), onSuccess: () => reset(), preserveState: true, preserveScroll: true });
    }

    return <form onSubmit={submit} className="w-full flex flex-row items-stretch mt-4">
        <div className="grow">
            <input type="text" className="w-full" placeholder="Aggiungi permesso..." value={data.name} onChange={(e) => setData('name',e.target.value)} />
            <label className="error">{errors.name}</label>
        </div>
        <input type="submit" className="button" value="Aggiungi" />
    </form >
}

export default function List() {
    let roles = usePage().props.roles;
    const perms = usePage().props.perms;
    const [processing,setProcessing] = useState( false );

    return <div className="main-container">
        <div className="w-full flex flex-row flex-wrap justify-center gap-4">
            { roles.map( role => RoleCard( role, perms, setProcessing ) ) }
        </div>
        { permissionAdd( setProcessing ) }
        <Link href={ route('permissions.verify') }>Verifica permessi</Link>
        <Backdrop open={processing} />
    </div>
}