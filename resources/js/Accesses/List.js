import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Backdrop from "../Layout/Backdrop";
import { disappearing, postRequest, romanize } from "../Utils";
import ReactSwitch from "react-switch";
import Dialog from "../Layout/Dialog";
import IdentityRoles from "./IdentityRoles";
import BlockParser from "../Blocks/BlockParser";

function identityEnabling(id, type, newState, setProcessing) {
    postRequest(
        'identity.enabling',
        { type: type, id: id, enabled: newState },
        setProcessing
    );
}

function lmthDelete(lmth, setProcessing) {
    postRequest(
        'lmth.delete',
        {},
        setProcessing,
        { lmth: lmth.id },
        false, false
    );
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

function Identity(idt, type, filter, setProcessing) {
    let key = idt.name + idt.surname + idt.login_methods.map(l => l.credential).join();
    let visible = filter ? key.toLowerCase().includes(filter.toLowerCase()) : true

    return (
        <div key={idt.id} style={disappearing(visible)} >
            <div className="mylist-item flex flex-row p-2 items-center gap-2">
                <ReactSwitch checked={idt.enabled} onChange={(checked) => identityEnabling(idt.id, type, checked, setProcessing)} />
                <div className="flex flex-col items-stretch justify-start">
                    <h3>{idt.surname} {idt.name}</h3>
                    <span className="text-gray-500">{type == 'alumnus' ? romanize(idt.coorte) : idt.notes}</span>
                    {idt.login_methods.map(lmth => LoginMethodSpan(lmth, setProcessing))}
                </div>
                <IdentityRoles identity={idt} type={type} setProcessing={setProcessing} />
            </div>
        </div>
    )
}

function Request(lmth, filter, setProcessing) {
    let key = lmth.credential + lmth.comment;
    let visible = filter ? key.toLowerCase().includes(filter.toLowerCase()) : true

    return (
        <div key={lmth.id} style={disappearing(visible)} >
            <div className="mylist-item flex flex-col p-2 items-start gap-2">
                <b>{lmth.credential}</b>
                <span className='whitespace-pre-line'>{lmth.comment}</span>
                {usePage().props.canAssociate ? <Link className="button" href={route('lmth.associate', { lmth: lmth.id })}>Associa</Link> : <span className="text-gray-400">Non hai il permesso per accettare questa richiesta</span>}
            </div>
        </div>
    )
}

export default function List() {
    const lmthds = usePage().props.lmthds
    const [filter, setFilter] = useState("")
    const [processing, setProcessing] = useState(false);
    const [section, setSection] = useState(''); // alumni - externals - requests

    return (
        <div className="main-container">
            {usePage().props.canAdd && <div className="w-full flex flex-row justify-end">
                <Link className="button" href={route('auth.manually_add')}>
                    <FontAwesomeIcon icon={solid('circle-plus')} />
                    Aggiungi
                </Link>
            </div>}
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
                    {lmthds.alumni.map(idt => Identity(idt, 'alumnus', filter, setProcessing))}
                </div>
                <div className={"tab " + (section == 'externals' ? "active" : "")}>
                    {lmthds.externals.map(idt => Identity(idt, 'external', filter, setProcessing))}
                </div>
                <div className={"tab " + (section == 'requests' ? "active" : "")}>
                    {lmthds.requests.map(lmthd => Request(lmthd, filter, setProcessing))}
                </div>
            </div>
            <Backdrop open={processing} />
        </div>
    );
}