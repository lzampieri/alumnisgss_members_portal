import { usePage } from '@inertiajs/react';
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { disappearing, postRequest, romanize } from "../Utils";
import NewExternal from "./NewExternal";
import BlocksList from "../Blocks/BlocksList";

function filterInput(filter, setFilter) {
    return <div className="w-full relative mb-4">
        <input type="text" className="w-full text-center" placeholder="Filtra..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        <FontAwesomeIcon icon={solid('magnifying-glass')} className="input-icon" />
    </div>
}

function associate(lmth, type, id, setProcessing) {
    postRequest(
        'lmth.associate',
        { type: type, id: id },
        setProcessing,
        { lmth: lmth.id }
    )
}

function Identity(lmth, idt, type, filter, setProcessing) {
    let key = idt.name + idt.surname + idt.coorte + romanize(idt.coorte) + idt.notes;
    let visible = filter ? key.toLowerCase().includes(filter.toLowerCase()) : true

    return (
        <div key={idt.id} style={disappearing(visible)} >
            <div className="mylist-item flex flex-row p-2 items-center justify-between gap-2">
                <div className="flex flex-col items-stretch justify-start">
                    <span>{idt.surname} {idt.name}</span>
                    <span className="text-gray-500">{type == 'alumnus' ? romanize(idt.coorte) : idt.notes}</span>
                </div>
                <div className="button" onClick={() => associate(lmth, type, idt.id, setProcessing)}>Associa</div>
            </div>
        </div>
    )
}

export default function Association() {
    const lmth = usePage().props.lmth
    const [filter, setFilter] = useState("")
    const [processing, setProcessing] = useState(false);
    const [section, setSection] = useState(''); // alumni - externals - new_external

    return (
        <div className="main-container">
            <h3>Approvazione richiesta di accesso</h3>
            <b>{lmth.credential}</b>( {lmth.driver} ) <br />
            <div className="text-gray-500">Richiesta il {new Date(lmth.created_at).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
            <div className="w-full md:w-3/4">
                <BlocksList blocks={lmth.blocks} />
            </div>

            <div className="w-full flex flex-row items-stretch mt-4">
                <div className={"tab-title " + (section == 'alumni' ? "active" : "")} onClick={() => setSection('alumni')}>
                    Alumno
                </div>
                <div className={"tab-title " + (section == 'externals' ? "active" : "")} onClick={() => setSection('externals')}>
                    Esterno
                </div>
                <div className={"tab-title " + (section == 'new_external' ? "active" : "")} onClick={() => setSection('new_external')}>
                    Crea nuovo esterno
                </div>
            </div>
            <div className="tabs-container">
                <div className={"tab " + (section == 'alumni' ? "active" : "")}> {/* Alumni */}
                    {filterInput(filter, setFilter)}

                    {usePage().props.alumni.map(idt => Identity(lmth, idt, 'alumnus', filter, setProcessing))}
                </div>
                <div className={"tab " + (section == 'externals' ? "active" : "")}> {/* Externals */}
                    {filterInput(filter, setFilter)}
                    {usePage().props.externals.map(idt => Identity(lmth, idt, 'external', filter, setProcessing))}
                </div>
                <div className={"tab " + (section == 'new_external' ? "active" : "")}> {/* New external */}
                    <div className="text-error font-bold p-2">Prima di creare una nuova identità, controllare con attenzione che non sia già presente nella tab <i>esterni</i>, per evitare doppioni.</div>
                    <div className="font-bold p-2">Non è possibile registrare nuove identità di alumni da qui, ma solo di esterni. Per nuovi alumni, usare l'applicativo <i>anagrafe</i>.</div>
                    <NewExternal lmth={lmth} />
                </div>
            </div>
            <Backdrop open={processing} />
        </div>
    );
}