

import { Head, Link, usePage } from "@inertiajs/react";

import { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { ClientSideRowModelModule, themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ColumnAutoSizeModule, QuickFilterModule } from 'ag-grid-community';
import { faAdd, faEye, faPencil, faTrash, faTrashArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NurDate } from "../Libs/DateEditor";
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule]);
import StateChip from "./StateChip";
import EmptyDialog from "../Layout/EmptyDialog";

function Actions({ data, setToDelete }) {
    return <div className="flex flex-row gap-2 leading-none">
        {data.can_edit && <Link className="button" href={route('reimbursements.edit', { id: data.id })}><FontAwesomeIcon icon={faPencil} /></Link>}
        {!data.can_edit && data.can_view && <Link className="button" href={route('reimbursements.view', { reimbursement: data.id })}><FontAwesomeIcon icon={faEye} /></Link>}
        {data.can_delete && <div className="button" onClick={() => setToDelete(data)}><FontAwesomeIcon icon={faTrash} /></div>}
        {data.can_restore && <Link className="button" href={route('reimbursements.restore', { reimbursement: data.id })}><FontAwesomeIcon icon={faTrashArrowUp} /></Link>}
    </div>
}

export default function Home() {

    const [quickFilter, setQuickFilter] = useState('');
    const [toDelete, setToDelete] = useState(null);

    const columns = useMemo(() => [
        { field: 'iden', headerName: '', filter: 'agTextColumnFilter' },
        { field: 'author', headerName: 'Richiedente', valueGetter: ({ data }) => data?.author?.name + " " + data?.author?.surname, filter: 'agTextColumnFilter' },
        { field: 'sent', headerName: 'Data di invio', valueGetter: ({ data }) => data?.sent ? (new NurDate(data.sent)).toNiceString() : "", filter: 'agTextColumnFilter' },
        { field: 'project.title', headerName: 'Progetto', filter: 'agTextColumnFilter' },
        { field: 'state', headerName: 'Stato', filter: 'agTextColumnFilter', cellRenderer: ({ value }) => <StateChip value={value} /> },
        { field: 'id', headerName: 'Azioni', cellRenderer: ({ data }) => <Actions data={data} setToDelete={setToDelete} /> },
    ], [])

    return <div className="main-container-large">
        <Head title="Rimborsi" />
        <div className="w-full flex flex-row gap-2 mb-1 items-end">
            {usePage().props.canCreate &&
                <Link className="button" href={route('reimbursements.create')}>
                    <FontAwesomeIcon icon={faAdd} className="mr-2" />
                    Crea nuova richiesta
                </Link>
            }
            <input className="input grow" placeholder="Cerca..." value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} />
        </div>
        <EmptyDialog
            open={toDelete}
            onClose={() => setToDelete(null)}>
            <p>Sei sicuro di voler eliminare la richiesta di rimborso <b>{toDelete?.iden}</b>?</p>
            <div className="flex flex-row justify-center mt-4 gap-4">
                <div className="button" onClick={() => setToDelete(null)}>
                    Annulla
                </div>
                <Link className="button" href={route('reimbursements.delete', { reimbursement: toDelete?.id || 0 })}>
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    Cancella
                </Link>
            </div>
        </EmptyDialog>
        <div className="h-[80vh] w-full">
            <AgGridReact
                columnDefs={columns}
                rowData={usePage().props.reimbursements}
                quickFilterText={quickFilter}
                theme={themeQuartz}
                gridOptions={{
                    autoSizeStrategy: {
                        type: 'fitCellContents'
                    },
                }} />
        </div>
        <div className="w-full flex flex-row justify-end text-sm text-primary-main">
            <Link href={route('reimbursements', { withTrashed: true })}>Mostra richieste eliminate</Link>
        </div>
    </div>
}