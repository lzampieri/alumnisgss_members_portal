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

function LmthdItem(lmthd, filter, editableRoles, setProcessing) {
    let key = lmthd.credential;
    key += lmthd.identity ? lmthd.identity.name + lmthd.identity.surname : "";
    let visible = filter ? key.toLowerCase().includes(filter.toLowerCase()) : true
    const [dropdownOpen, setDropdownOpen] = useState(true);

    // TODO sistemare questa pagina con la gestione delle identità
    return (
        <div key={lmthd.id} style={ disappearing( visible ) } >
            <div className="mylist-item flex flex-row p-2 items-center gap-2">
                <Switch checked={lmthd.enabled} onChange={(checked) => userEnabling(lmthd.id, checked, setProcessing)} />
                <div className={"flex flex-col" + (lmthd.enabled ? "" : " text-gray-400")}>
                    {lmthd.credential}
                    <div className="text-gray-400 text-sm">Registrato il {new Date(Date.parse(lmthd.created_at)).toLocaleDateString('it-IT')}</div>
                    <div className="text-gray-400 text-sm">Ultimo accesso {new Date(Date.parse(lmthd.last_login)).toLocaleString('it-IT')}</div>
                </div>
                { lmthd.enabled && <>
                    {lmthd.identity && lmthd.identity.roles.map(role =>
                        <div className="chip" key={role}>
                            {Roles.names[role.name]}
                            {editableRoles.indexOf(role.name) > -1 ?
                                <FontAwesomeIcon icon={solid('xmark')} className="ml-1 px-1 hover:text-white hover:bg-gray-700 rounded-full" onClick={() => userRoleRemove(lmthd.id, role.name, setProcessing)} />
                                : ""}
                        </div>
                    )}
                    <div className="icon-button dropdown-parent group">
                        <FontAwesomeIcon icon={solid('plus')} onClick={() => setDropdownOpen(!dropdownOpen)} />
                        <div className="dropdown-content-flex flex-col gap-2">
                            {editableRoles.map(role => (
                                lmthd.identity && lmthd.identity.roles.indexOf(role) > -1 ? "" :
                                    <div className="chip cursor-pointer" key={role} onClick={() => userRoleAdd(lmthd.id, role, setProcessing)} >{Roles.names[role]}</div>
                            ))}
                        </div>
                    </div>
                </> }
            </div>
        </div>
    )
}

export default function List() {
    const lmthds = usePage().props.lmthds
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
                {lmthds.map(lmthd => LmthdItem(lmthd, filter, editableRoles, setProcessing))}
            </div>
            <Backdrop open={processing} />
        </div>
    );
}