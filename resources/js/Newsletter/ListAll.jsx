

import { Head, Link, usePage } from "@inertiajs/react";

import { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { TextFilterModule, themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule } from 'ag-grid-community';
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel } from "../Utils";
import { faEnvelopeOpen, faEye, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EmptyDialog from "../Layout/EmptyDialog";
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule,TextFilterModule]);


export default function List() {
    const [toDelete,setToDelete] = useState(null);

    const computeStatus = ({data}) => {
        let status = "";
        if( data.sent_at ) {
            status += "Inviata " + new Date(data?.sent_at).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } else if( data.from == 'SMTP' ) {
            status += "Programmata"
        } else {
            status += "Bozza"
        }

        if( data.parent_id )
            status += " - Derivata";

        return status;
    }

    const columns = [
        {
            field: 'owner', headerName: 'Autore',
            valueGetter: ({ data }) => data.owner.surname + " " + data.owner.name, filter: 'agTextColumnFilter',
        },
        {
            field: 'updated_at', headerName: 'Ultima modifica',
            valueGetter: ({ data }) => new Date(data?.updated_at).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' }), filter: 'agTextColumnFilter',
        },
        {
            field: 'subject', headerName: 'Oggetto', filter: 'agTextColumnFilter'
        },
        {
            field: 'count', headerName: 'Numero destinatari', valueGetter: ({ data }) => data.countTo || 0, filter: 'agTextColumnFilter'
        },
        {
            field: 'status', headerName: 'Stato', valueGetter: computeStatus,
        },
        {
            field: 'go', headerName: '', valueGetter: ({ data }) => data.id, cellRenderer: ({ value, data }) => <>
                <Link className="button" href={route('newsletter.view', { id: value })}><FontAwesomeIcon icon={faEye} /></Link>
                {data.can_edit && <Link className="button" href={route('newsletter.edit', { id: value })}><FontAwesomeIcon icon={faPenToSquare} /></Link>}
                {data.can_delete && <span className="button" onClick={() => setToDelete(data)}><FontAwesomeIcon icon={faTrash} /></span>}
            </>
        },
        {
            field: 'from', headerName: 'Canale',
        }
    ]

    const [quickFilter, setQuickFilter] = useState('')

    return <div className="main-container-large">
        <Head title="Newsletter" />
        <div className="w-full flex flex-row gap-2 mb-1 items-start">
            <input type="text" className="grow" value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder="Filtra.../ Ancora non implementato" />
            {usePage().props.canCreate && <Link className="button mb-2 grow-0" href={route('newsletter.create')}>
                <FontAwesomeIcon icon={faEnvelopeOpen} className="pr-2" />
                Nuova email
            </Link>}
        </div>
        <EmptyDialog open={!!toDelete} onClose={() => setToDelete(null)}>
            Sei sicuro di voler cancellare la bozza di newsletter:<br/>
            <b>{toDelete?.subject}</b>
            <div className="flex flex-row gap-2">
                <div className="button" onClick={() => setToDelete(null)}>Annulla</div>
                <Link className="button" href={route('newsletter.delete', { newsletter: toDelete?.id || 0 })}>Elimina bozza</Link>
            </div>
            </EmptyDialog>

        <div className='w-full h-[50vh]'>
            <AgGridReact
                columnDefs={columns}
                quickFilterText={quickFilter}
                theme={themeQuartz}
                suppressCellFocus={true}
                rowData={usePage().props.list}
            />
        </div>
    </div>
}