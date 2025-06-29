import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/react";
// import { AlumnusStatus, bgAndContrast, bgAndContrastPastel, romanize } from "../Utils";
import { useMemo, useState } from "react";
// import SmartChip from "./SmartChip";

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, RowAutoHeightModule, QuickFilterModule } from 'ag-grid-community';
import { bgAndContrastPastel, postRequest, romanize } from "../Utils";
import Backdrop from "../Layout/Backdrop";
import Dialog from "../Layout/Dialog";
import ManuallyAdd from "./ManuallyAdd";
import { identity } from "lodash";
import NewExternal from "./NewExternal";
ModuleRegistry.registerModules([ClientSideRowModelModule, RowAutoHeightModule, QuickFilterModule]);

const TYPE_ALUMNUS = 0;
const TYPE_EXTERNAL = 1;

function whichType(item) {
    if (item.status) return TYPE_ALUMNUS;
    return TYPE_EXTERNAL;
}

function EmailDiv({ e }) {
    return <div>
        <FontAwesomeIcon icon={solid('at')} className="mr-2" />
        {e.address}
        {e.last_login && <span className="text-gray-400 ml-2">Last seen {new Date(e.last_login).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>}
    </div>
}


function IdentityContent({ data, associateAddress }) {
    // TYPE_ALUMNUS or TYPE_EXTERNAL
    return <div className={
        "w-full border-2 rounded  flex flex-row p-2 min-h-[3rem] justify-center gap-2 leading-normal	" +
        (whichType(data) == TYPE_ALUMNUS ? ' border-primary-main' : ' border-[#00FF00]')}  >
        <FontAwesomeIcon icon={whichType(data) == TYPE_ALUMNUS ? solid('person') : solid('person-digging')} className="text-4xl" />
        <div className="grow flex flex-col">
            <b>{data.name} {data.surname}</b>
            {whichType(data) == TYPE_ALUMNUS && romanize(data.coorte)}
            {data.notes}
            {data.emails.map((e) => <EmailDiv key={e.id} e={e} />)}
        </div>
        <FontAwesomeIcon icon={solid('check')} className="text-4xl button icon-button" onClick={() => associateAddress(data)} />
    </div>
}

function stringifyData({ data }) {
    return data.name + " " + data.surname + " " + romanize(data.coorte) +
        " " + data.emails.map((e) => e.address).join(" ")
}

function ListAsATable({ identities, quickFilter, associateAddress }) {

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
                <IdentityContent data={value} associateAddress={associateAddress} />,
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

function associate(email, identity, setProcessing, setToAssociate) {
    postRequest(
        'emails.associate',
        { identity: identity.id, type: whichType(identity) == TYPE_ALUMNUS ? 'alumnus' : 'external' },
        setProcessing,
        { id: email.id },
        false, false,
        () => {
            setToAssociate(null);
        }
    );
}

function deleteRequest(email, setProcessing) {
    postRequest(
        'emails.delete',
        { id: email.id },
        setProcessing,
        { },
        false, false
    );
}

export default function List() {
    const data = usePage().props.list;
    const subject = usePage().props.subject;
    const list = useMemo(() => data['externals'].concat(data['alumni']), [data]);
    const [quickFilter, setQuickFilter] = useState('')
    const [processing, setProcessing] = useState(false);
    const [toAssociate, setToAssociate] = useState(null);
    const [del, setDel] = useState(false);
    const [adding, setAdding] = useState(false);

    return <div className="main-container-large h-[80vh] gap-1">
        <h3>Approvazione richiesta di accesso</h3>
        {subject.address}<br />
        <div className="text-gray-500">Richiesta il {new Date(subject.created_at).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
        <div className="w-full md:w-3/4">
            <span className='whitespace-pre-line'>{subject.comment}</span>
        </div>


        <div className="w-full md:w-3/5 flex flex-row justify-center gap-2">
            <input className="grow" type='text' value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder='Cerca...' />
            <div className="button text-2xl" onClick={() => setAdding(true)}>
                <FontAwesomeIcon icon={solid('plus')} className="pr-1" />
            </div>
            <div className="button text-2xl" onClick={() => setDel(true)}>
                <FontAwesomeIcon icon={solid('trash')} className="pr-1" />
            </div>
        </div>

        <ListAsATable
            identities={list} quickFilter={quickFilter}
            associateAddress={(e) => setToAssociate(e)}
        />

        <NewExternal subject={subject} open={adding} setOpen={setAdding} />

        <Backdrop open={processing} />
        <Dialog open={!!toAssociate} onClose={() => setToAssociate(null)} onConfirm={() => associate(subject, toAssociate, setProcessing, setToAssociate)}>
            Sei sicuro di voler associare l'indirizzo mail {subject.address} a <b>{toAssociate?.name} {toAssociate?.surname}</b>?
        </Dialog>
        <Dialog open={del} onClose={() => setDel(false)} onConfirm={() => deleteRequest(subject, setProcessing)}>
            Sei sicuro di voler cancellare la richiesta di accesso per l'indirizzo mail <b>{subject.address}</b>?
        </Dialog>
    </div>
}
