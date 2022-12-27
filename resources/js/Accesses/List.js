import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { usePage } from "@inertiajs/inertia-react";
import { useState } from "react";
import Switch from "react-switch";
import Backdrop from "../Layout/Backdrop";
import { Inertia } from "@inertiajs/inertia";
import { disappearing, Roles } from "../Utils";

function userEnabling(id, newState, setProcessing) {
    setProcessing(true);
    Inertia.post(
        route('user.enabling', { user: id }),
        { enabled: newState },
        { onFinish: () => { setProcessing(false) }, preserveState: true, preserveScroll: true }
    )
}

function userRoleAdd(id, role, setProcessing) {
    setProcessing(true);
    Inertia.post(
        route('user.roles', { user: id }),
        { role: role, action: 'add' },
        { onFinish: () => { setProcessing(false) }, preserveState: true, preserveScroll: true }
    )
}

function userRoleRemove(id, role, setProcessing) {
    setProcessing(true);
    Inertia.post(
        route('user.roles', { user: id }),
        { role: role, action: 'remove' },
        { onFinish: () => { setProcessing(false) }, preserveState: true, preserveScroll: true }
    )
}

function UserItem(user, filter, editableRoles, setProcessing) {
    let visible = filter ? user.email.toLowerCase().includes(filter.toLowerCase()) : true
    const [dropdownOpen, setDropdownOpen] = useState(true);

    return (
        <div key={user.id} style={ disappearing( visible ) } >
            <div className="mylist-item flex flex-row p-2 items-center gap-2">
                <Switch checked={user.enabled} onChange={(checked) => userEnabling(user.id, checked, setProcessing)} />
                <div className={"flex flex-col" + (user.enabled ? "" : " text-gray-400")}>
                    {user.email}
                    <div className="text-gray-400 text-sm">Registrato il {new Date(Date.parse(user.created_at)).toLocaleDateString('it-IT')}</div>
                    <div className="text-gray-400 text-sm">Ultimo accesso {new Date(Date.parse(user.last_login)).toLocaleString('it-IT')}</div>
                </div>
                { user.enabled && <>
                    {user.roles.map(role =>
                        <div className="chip" key={role}>
                            {Roles.names[role.name]}
                            {editableRoles.indexOf(role.name) > -1 ?
                                <FontAwesomeIcon icon={solid('xmark')} className="ml-1 px-1 hover:text-white hover:bg-gray-700 rounded-full" onClick={() => userRoleRemove(user.id, role.name, setProcessing)} />
                                : ""}
                        </div>
                    )}
                    <div className="icon-button dropdown-parent group">
                        <FontAwesomeIcon icon={solid('plus')} onClick={() => setDropdownOpen(!dropdownOpen)} />
                        <div className="dropdown-content-flex flex-col gap-2">
                            {editableRoles.map(role => (
                                user.roles.indexOf(role) > -1 ? "" :
                                    <div className="chip cursor-pointer" key={role} onClick={() => userRoleAdd(user.id, role, setProcessing)} >{Roles.names[role]}</div>
                            ))}
                        </div>
                    </div>
                </> }
            </div>
        </div>
    )
}

export default function List() {
    const users = usePage().props.users
    const editableRoles = usePage().props.editableRoles
    const [filter, setFilter] = useState("")
    const [processing, setProcessing] = useState(false);

    return (
        <div className="main-container">
            <div className="w-full relative mb-4">
                <input type="text" className="w-full text-center" placeholder="Filtra..." value={filter} onChange={(e) => setFilter(e.target.value)} />
                <FontAwesomeIcon icon={solid('magnifying-glass')} className="input-icon" />
            </div>
            <div className="w-full flex flex-col items-stretch mt-4">
                {users.map(user => UserItem(user, filter, editableRoles, setProcessing))}
            </div>
            <Backdrop open={processing} />
        </div>
    );
}