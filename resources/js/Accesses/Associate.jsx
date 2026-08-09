

import { Head, Link, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, RowAutoHeightModule, QuickFilterModule } from 'ag-grid-community';
import { bgAndContrastPastel, postRequest, romanize } from "../Utils";
import Backdrop from "../Layout/Backdrop";
import Dialog from "../Layout/Dialog";
import { faAt, faCheck, faPerson, faPersonDigging, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import EmptyDialog from "../Layout/EmptyDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
ModuleRegistry.registerModules([ClientSideRowModelModule, RowAutoHeightModule, QuickFilterModule]);

function EmailDiv({ e }) {
    return <div>
        <FontAwesomeIcon icon={faAt} className="mr-2" />
        {e.address}
        {e.last_login && <span className="text-gray-400 ml-2">Last seen {new Date(e.last_login).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>}
    </div>
}


function IdentityContent({ data, associateAddress }) {
    return <div className={
        "w-full border-2 rounded  flex flex-row p-2 min-h-[3rem] justify-center gap-2 leading-normal	" +
        (data.coorte > 0 ? ' border-primary-main' : ' border-[#00FF00]')}  >
        <FontAwesomeIcon icon={faPerson} className="text-4xl" />
        <div className="grow flex flex-col">
            <b>{data.name} {data.surname}</b>
            {romanize(data.coorte)}
            {data.notes}
            {data.emails.map((e) => <EmailDiv key={e.id} e={e} />)}
        </div>
        <FontAwesomeIcon icon={faCheck} className="text-4xl button icon-button" onClick={() => associateAddress(data)} />
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
        { identity: identity.id },
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
        {},
        false, false
    );
}


function NewProfile({ subject, open, setOpen }) {

    return <EmptyDialog open={open} onClose={() => setOpen(false)}>
        <h3>Crea nuovo profilo</h3>
        <div className="text-error font-bold p-2">Prima di creare una nuova identità, controllare con attenzione che non sia già presente, per evitare doppioni.</div>
        <Link
            href={route('person.add',{associate_to: subject.id})}
            className="button">
            Vai alla pagina di creazione
        </Link>
    </EmptyDialog>
}

export default function List() {
    const list = usePage().props.people;
    const subject = usePage().props.subject;
    const [quickFilter, setQuickFilter] = useState('')
    const [processing, setProcessing] = useState(false);
    const [toAssociate, setToAssociate] = useState(null);
    const [del, setDel] = useState(false);
    const [adding, setAdding] = useState(false);

    return <div className="main-container-large h-[80vh] gap-1">
        <Head title={"Approvazione " + subject.address} />
        <h3>Approvazione richiesta di accesso</h3>
        {subject.address}<br />
        <div className="text-gray-500">Richiesta il {new Date(subject.created_at).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
        <div className="w-full md:w-3/4">
            <span className='whitespace-pre-line'>{subject.comment}</span>
        </div>


        <div className="w-full md:w-3/5 flex flex-row justify-center gap-2">
            <input className="grow" type='text' value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder='Cerca...' />
            <div className="button text-2xl" onClick={() => setAdding(true)}>
                <FontAwesomeIcon icon={faPlus} className="pr-1" />
            </div>
            <div className="button text-2xl" onClick={() => setDel(true)}>
                <FontAwesomeIcon icon={faTrash} className="pr-1" />
            </div>
        </div>

        <ListAsATable
            identities={list} quickFilter={quickFilter}
            associateAddress={(e) => setToAssociate(e)}
        />

        <NewProfile subject={subject} open={adding} setOpen={setAdding} />

        <Backdrop open={processing} />
        <Dialog open={!!toAssociate} onClose={() => setToAssociate(null)} onConfirm={() => associate(subject, toAssociate, setProcessing, setToAssociate)}>
            Sei sicuro di voler associare l'indirizzo mail {subject.address} a <b>{toAssociate?.name} {toAssociate?.surname}</b>, e l'automatica abilitazione del profilo?
        </Dialog>
        <Dialog open={del} onClose={() => setDel(false)} onConfirm={() => deleteRequest(subject, setProcessing)}>
            Sei sicuro di voler cancellare la richiesta di accesso per l'indirizzo mail <b>{subject.address}</b>?
        </Dialog>
    </div>
}
