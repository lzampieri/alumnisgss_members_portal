import { Link, useForm, usePage } from "@inertiajs/inertia-react";
import { useState } from "react";
import ReactSwitch from "react-switch";
import { Roles } from "../Utils";
import Backdrop from "../Layout/Backdrop";
import { Inertia } from "@inertiajs/inertia";
import ResponsiveDrawer from "../Layout/ResponsiveDrawer";

function RoleCard( role, perms, setProcessing ) {
    return <div className="w-full bg-gray-200 rounded-xl p-4" key={role.name}>
        <label>{ role.name }</label>
        <h3>{ role.common_name }</h3>
        <div className="md:columns-2">
            { perms.map( pm => PermissionSwitch( pm, role.permissions_names.includes( pm ), role.name, setProcessing ) ) }
        </div>
        <div className="flex flex-row flex-wrap justify-center mt-4 gap-2">
            { role.identities.map( identity => IdentityChip( identity, setProcessing ) ) }
        </div>
    </div>
}

function PermissionSwitch( permission, checked, role, setProcessing ) {
    return <div className="w-full flex flex-row items-baseline gap-1" key={permission}>
        <ReactSwitch height={14} width={28} checked={checked} onChange={(newState) => onChange(newState,permission,role,setProcessing)} /> {permission}
    </div>
}

function IdentityChip( identity, setProcessing ) {
    return <div className="chip" key={identity.id}>
        { identity.name } { identity.surname }
        {/* <ReactSwitch height={14} width={28} checked={checked} onChange={(newState) => onChange(newState,permission,role,setProcessing)} /> {permission} */}
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
    const [selected,setSelected] = useState( roles[0] );

//     <div className="main-container">
//     <div className="w-full flex flex-row flex-wrap justify-center gap-4">
//         { roles.map( role => RoleCard( role, perms, setProcessing ) ) }
//     </div>
//     { permissionAdd( setProcessing ) }
//     <Link href={ route('permissions.verify') }>Verifica permessi</Link>
//     <Backdrop open={processing} />
// </div>


    return <div className="main-container-drawer">
        <ResponsiveDrawer buttonTitle={ selected ? selected.common_name : "Ruoli" } initiallyOpen={ !selected }>
            <ResponsiveDrawer.Drawer>
                { roles.map( role =>
                    <div
                        className={ 
                            "border border-black rounded-first-last p-2 cursor-pointer " +
                            (
                                selected?.name == role.name  
                                ? "bg-primary-main text-primary-contrast"
                                : "bg-white text-black hover:text-primary-contrast hover:bg-primary-main"
                            ) }
                        onClick={ () => setSelected( role ) }
                        >
                        { role.common_name }
                    </div>
                )}
            </ResponsiveDrawer.Drawer>
            { selected && RoleCard( selected, perms, setProcessing ) }
        </ResponsiveDrawer>
    </div>
}