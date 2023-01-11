import { usePage } from "@inertiajs/inertia-react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Backdrop from "../Layout/Backdrop";
import { disappearing } from "../Utils";
import ReactSwitch from "react-switch";
import { Inertia } from "@inertiajs/inertia";
import Dialog from "../Layout/Dialog";

function identityEnabling(id, type, newState, setProcessing) {
    setProcessing(true);
    Inertia.post(
        route('identity.enabling'),
        { type: type, id: id, enabled: newState },
        { onFinish: () => { setProcessing(false) }, preserveState: true, preserveScroll: true }
    )
}

function lmthDelete(lmth, setProcessing) {
    setProcessing(true);
    Inertia.post(
        route('lmth.delete', { lmth: lmth.id }),
        { },
        { onFinish: () => { setProcessing(false) }, preserveState: false }
    )
}

function LoginMethodSpan(lmth, setProcessing) {
    const [open, setOpen] = useState(false);

    return (
        <span className="text-sm" key={lmth.id}>
            {lmth.credential} ({lmth.driver})
            <FontAwesomeIcon icon={solid('trash')} className="icon-button" onClick={() => setOpen(true)} />
            <Dialog open={open} onClose={() => setOpen(false)} onConfirm={() => { setOpen(false); lmthDelete(lmth, setProcessing) }}>
                Sei sicuro di voler eliminare l'accesso con le credenziali {lmth.credential} ({lmth.driver} )?
            </Dialog>
        </span>
    )
}

function Identity(idt, type, filter, editableRoles, setProcessing) {
    let key = idt.name + idt.surname + idt.login_methods.map(l => l.credential).join();
    let visible = filter ? key.toLowerCase().includes(filter.toLowerCase()) : true
    const [dropdownOpen, setDropdownOpen] = useState(true);

    return (
        <div key={idt.id} style={disappearing(visible)} >
            <div className="mylist-item flex flex-row p-2 items-center gap-2">
                <ReactSwitch checked={idt.enabled} onChange={(checked) => identityEnabling(idt.id, type, checked, setProcessing)} />
                <div className="flex flex-col items-stretch justify-start">
                    <h3>{idt.surname} {idt.name}</h3>
                    {idt.login_methods.map(lmth => LoginMethodSpan(lmth, setProcessing))}
                </div>
                {key}
                {/* <Switch checked={lmthd.enabled} onChange={(checked) => userEnabling(lmthd.id, checked, setProcessing)} />
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
                </> } */}
            </div>
        </div>
    )
}

export default function List() {
    const lmthds = usePage().props.lmthds
    const editableRoles = usePage().props.editableRoles
    const [filter, setFilter] = useState("")
    const [processing, setProcessing] = useState(false);
    const [section, setSection] = useState('externals'); // alumni - externals - requests

    return (
        <div className="main-container">
            <div className="w-full relative mb-4">
                <input type="text" className="w-full text-center" placeholder="Filtra..." value={filter} onChange={(e) => setFilter(e.target.value)} />
                <FontAwesomeIcon icon={solid('magnifying-glass')} className="input-icon" />
            </div>

            <div className="w-full flex flex-row items-stretch">
                <div className={"tab-title " + (section == 'alumni' ? "active" : "")} onClick={() => setSection('alumni')}>
                    Alumni
                </div>
                <div className={"tab-title " + (section == 'externals' ? "active" : "")} onClick={() => setSection('externals')}>
                    Esterni
                </div>
                <div className={"tab-title " + (section == 'requests' ? "active" : "")} onClick={() => setSection('requests')}>
                    Richieste {lmthds.requests.length > 0 && <b>({lmthds.requests.length})</b>}
                </div>
            </div>
            <div className="tabs-container">
                <div className={"tab " + (section == 'alumni' ? "active" : "")}>
                    {lmthds.alumni.map(idt => Identity(idt, 'alumnus', filter, editableRoles, setProcessing))}
                </div>
                <div className={"tab " + (section == 'externals' ? "active" : "")}>
                    {lmthds.externals.map(idt => Identity(idt, 'external', filter, editableRoles, setProcessing))}
                </div>
                <div className={"tab " + (section == 'requests' ? "active" : "")}>
                    {/* {lmthds.map(lmthd => LmthdItem(lmthd, filter, editableRoles, setProcessing))} */}
                </div>
            </div>
            <Backdrop open={processing} />
        </div>
    );
}