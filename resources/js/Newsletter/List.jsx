

import { Head, Link, usePage } from "@inertiajs/react";

import { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { TextFilterModule, themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule } from 'ag-grid-community';
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel } from "../Utils";
import { faEnvelopeOpen, faEye, faPenToSquare, faTrash, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EmptyDialog from "../Layout/EmptyDialog";
import InlinePie from "./InlinePie";
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule, TextFilterModule]);


export default function List() {
    const [toDelete,setToDelete] = useState(null);

    const showCake = ({ value, data }) => {
        return <div className="flex flex-row gap-2 items-center"><InlinePie primary={data.totalSentTo} secondary={data.totalScheduled} total={data.totalCountTo} /> {data.totalSentTo}/{data.totalCountTo} {data.totalScheduled > 0 &&
            "(" + data.totalScheduled + " progr.)"
        }</div>};


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
            field: 'count', headerName: 'Invio', valueGetter: ({ data }) => data?.totalCountTo || 0, filter: 'agTextColumnFilter', cellRenderer: showCake
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
            <input type="text" className="grow" value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder="Filtra..." />
            {usePage().props.canCreate && <Link className="button mb-2 grow-0" href={route('newsletter.create')}>
                <FontAwesomeIcon icon={faEnvelopeOpen} className="pr-2" />
                Nuova email
            </Link>}
            <Link className="button mb-2 grow-0" href={route('mailinglist')}>
                <FontAwesomeIcon icon={faTruckFast} className="pr-2" />
                Mailing list
            </Link>
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
        <div className="w-full flex flex-row justify-end">
            <Link href={route('newsletters.listAll')}>Mostra tutte</Link>
        </div>
    </div>
}