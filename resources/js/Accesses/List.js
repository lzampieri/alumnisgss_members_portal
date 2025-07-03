import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/react";
// import { AlumnusStatus, bgAndContrast, bgAndContrastPastel, romanize } from "../Utils";
import { useMemo, useState } from "react";
// import SmartChip from "./SmartChip";

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, RowAutoHeightModule, QuickFilterModule } from 'ag-grid-community';
import { bgAndContrastPastel, pastelColors, postRequest, romanize } from "../Utils";
import Backdrop from "../Layout/Backdrop";
import Dialog from "../Layout/Dialog";
import ManuallyAdd from "./ManuallyAdd";
import ReactSwitch from "react-switch";
ModuleRegistry.registerModules([ClientSideRowModelModule, RowAutoHeightModule, QuickFilterModule]);

const TYPE_ALUMNUS = 0;
const TYPE_EXTERNAL = 1;
const TYPE_REQUEST = 2;

function whichType(item) {
    if (item.address) return TYPE_REQUEST;
    if (item.status) return TYPE_ALUMNUS;
    return TYPE_EXTERNAL;
}

function EmailDiv({ e, deleteAddress }) {
    return <div>
        <FontAwesomeIcon icon={solid('at')} className="mr-2" />
        {e.address}
        {e.last_login && <span className="text-gray-400 ml-2">Last seen {new Date(e.last_login).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>}
        {e.can_delete && <FontAwesomeIcon icon={solid('trash')} className="icon-button ml-2" onClick={() => deleteAddress(e)} />}
    </div>
}

function IdentityRoles({ identity, removeRole, addRole }) {
    const editableRoles = usePage().props.editableRoles
    const editableRolesNames = editableRoles.map(role => role.name)
    const identityRolesNames = identity.roles.map(role => role.name)

    const [addDrawer, setAddDrawer] = useState(false);

    return <div className="flex flex-row w-full items-start mt-2 flex-wrap gap-2">
        {
            identity.roles.map(role =>
                <div className="rounded flex flex-row !no-underline items-center" style={bgAndContrastPastel(9)} key={role.name}>
                    <span className="px-2">{role.common_name}</span>
                    {editableRolesNames.indexOf(role.name) > -1 ?
                        <FontAwesomeIcon icon={solid('xmark')} className="hover:bg-gray-100 hover:text-black cursor-pointer p-1 aspect-square rounded" onClick={() => removeRole(identity, role)} />
                        : ""}
                </div>
            )
        }
        <div className="icon-button" onClick={() => setAddDrawer(!addDrawer)}>
            <FontAwesomeIcon icon={addDrawer ? solid('xmark') : solid('plus')} />
        </div>
        {addDrawer &&
            <div className="flex flex-row w-full items-start mt-2 flex-wrap gap-2">
                {editableRoles.map(role => (
                    identityRolesNames.indexOf(role.name) > -1 ? "" :
                        <div
                            className="rounded flex flex-row !no-underline items-center cursor-pointer"
                            style={bgAndContrastPastel(6)}
                            key={role.name}
                            onClick={() => addRole(identity, role)} >
                            <FontAwesomeIcon icon={solid('plus')} className="p-1 aspect-square rounded" />
                            <span className="px-2">{role.common_name}</span>
                        </div>
                ))}
            </div>
        }
    </div>
}

function IdentityContent({ data, deleteAddress, removeRole, addRole, setEnabled }) {
    if (whichType(data) == TYPE_REQUEST) {
        return <div className="w-full border-2 border-black rounded border-dashed flex flex-row p-2 min-h-[3rem] justify-center gap-2 leading-normal	">
            <FontAwesomeIcon icon={solid('person-circle-question')} className="text-4xl" />
            <div className="grow flex flex-col items-start">
                <div>
                    <FontAwesomeIcon icon={solid('at')} className="mr-2" />
                    {data.address}
                </div>
                <span className='whitespace-pre-line'>{data.comment}</span>
                {!usePage().props.canAssociate &&
                    <span className="text-gray-400">Non hai il permesso per accettare questa richiesta</span>
                }
            </div>
            {usePage().props.canAssociate &&
                <Link className="text-4xl button icon-button" href={route('emails.associate', { id: data.id })}>
                    <FontAwesomeIcon icon={solid('angles-right')} />
                </Link>

            }
        </div>

    }

    // TYPE_ALUMNUS or TYPE_EXTERNAL
    return <div className={
        "w-full border-2 rounded  flex flex-row p-2 min-h-[3rem] justify-center gap-2 leading-normal	" +
        (whichType(data) == TYPE_ALUMNUS ? ' border-primary-main' : ' border-[#00FF00]')}  >
        <div className="flex flex-col">
            <FontAwesomeIcon icon={whichType(data) == TYPE_ALUMNUS ? solid('person') : solid('person-digging')} className="text-4xl" style={{ color: pastelColors[ data.enabled ? 4 : 2 ]}} />
            <ReactSwitch
                    height={14} width={28} className="m-2"
                    checked={data.enabled} onChange={(newState) => setEnabled(data,newState)}
                />
        </div>
        <div className="grow flex flex-col">
            <b>{data.name} {data.surname}</b>
            {whichType(data) == TYPE_ALUMNUS && romanize(data.coorte)}
            {data.notes}
            {data.emails.map((e) => <EmailDiv key={e.id} e={e} deleteAddress={deleteAddress} />)}
            <IdentityRoles identity={data} removeRole={removeRole} addRole={addRole} />
        </div>
    </div>
}

function stringifyData({ data }) {
    if (whichType(data) == TYPE_REQUEST)
        return data.address + " " + data.comment
    return data.name + " " + data.surname + " " + romanize(data.coorte) +
        " " + data.emails.map((e) => e.address).join(" ") +
        " " + data.roles.map((r) => r.name + " " + r.common_name ).join(" ")
}

function ListAsATable({ identities, quickFilter, deleteAddress, removeRole, addRole, setEnabled }) {

    const theme = themeQuartz.withParams({
        headerHeight: 0,
        rowBorder: false,
        rowHoverColor: "#00000000",
        borderColor: "#00000000",
    })

    const columns = useMemo(() => [
        {
            field: 'main',
            cellRenderer: ({ value }) =>
                <IdentityContent data={value} deleteAddress={deleteAddress} removeRole={removeRole} addRole={addRole} setEnabled={setEnabled} />,
            filter: 'agTextColumnFilter',
            filterValueGetter: stringifyData,
            valueGetter: ({ data }) => data,
            autoHeight: true,
            flex: 1
        },
    ], [])

    return <div className='ag-theme-quartz w-full md:w-3/5 grow'>
        <AgGridReact
            rowData={identities}
            columnDefs={columns}
            quickFilterText={quickFilter}
            theme={theme}
            suppressCellFocus={true}
        />
    </div>
}

function emailDelete(e, setProcessing, setToDelete) {
    postRequest(
        'emails.delete',
        { id: e.id },
        setProcessing,
        {},
        false, false,
        () => setToDelete(null)
    );
}

function removeRole(identity, role, setProcessing) {
    postRequest(
        'roles.remove',
        { identity: identity.id, type: whichType(identity) == TYPE_ALUMNUS ? 'alumnus' : 'external', role: role.id },
        setProcessing,
        {},
        false, false
    );
}

function addRole(identity, role, setProcessing) {
    postRequest(
        'roles.add',
        { identity: identity.id, type: whichType(identity) == TYPE_ALUMNUS ? 'alumnus' : 'external', role: role.id },
        setProcessing,
        {},
        false, false
    );
}

function setEnabled(identity, enabled, setProcessing) {
    postRequest(
        'identity.enabled',
        { identity: identity.id, type: whichType(identity) == TYPE_ALUMNUS ? 'alumnus' : 'external', enabled: enabled },
        setProcessing,
        {},
        false, false
    );
}

export default function List() {
    const data = usePage().props.list;
    const list = useMemo(() => data['requests'].concat(data['externals']).concat(data['alumni']), [data]);
    const [quickFilter, setQuickFilter] = useState('')
    const [processing, setProcessing] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [addOpen, setAddOpen] = useState(false);

    return <div className="main-container-large h-[80vh] gap-1">
        <div className="w-full flex flex-row justify-center gap-2">
            <input className="w-full md:w-1/2" type='text' value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder='Cerca...' />
            {usePage().props.canAdd &&
                <div className="button flex flex-row items-baseline" onClick={() => setAddOpen(true)}>
                    <FontAwesomeIcon icon={solid('circle-plus')} className="pr-1" />
                    Aggiungi
                </div>
            }
        </div>
        <ManuallyAdd open={addOpen} setClosed={() => setAddOpen(false)} />
        <ListAsATable
            identities={list} quickFilter={quickFilter}
            deleteAddress={(e) => setToDelete(e)}
            removeRole={(identity, role) => removeRole(identity, role, setProcessing)}
            addRole={(identity, role) => addRole(identity, role, setProcessing)}
            setEnabled={(identity, enabled) => setEnabled(identity, enabled, setProcessing)}
        />
        <Backdrop open={processing} />
        <Dialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => emailDelete(toDelete, setProcessing, setToDelete)}>
            Sei sicuro di voler eliminare l'indirizzo mail {toDelete?.address}?
        </Dialog>
    </div>
}
