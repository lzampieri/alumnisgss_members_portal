import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Head, Link, usePage } from "@inertiajs/react";

import { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule } from 'ag-grid-community';
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel } from "../Utils";
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule]);


export default function List() {

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
            field: 'count', headerName: 'Numero destinatari', valueGetter: ({ data }) => data?.to?.length || 0, filter: 'agTextColumnFilter'
        },
        {
            field: 'status', headerName: 'Stato', valueGetter: ({ data }) => data.sent_at ? "Inviata " + new Date(data?.sent_at).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' }) : "Bozza", filter: 'agTextColumnFilter',
        },
        {
            field: 'go', headerName: '', valueGetter: ({ data }) => data.id, cellRenderer: ({ value, data }) => <>
                {data.sent_at ? ""
                    : <Link className="button" href={route('newsletter.edit', { id: value })}><FontAwesomeIcon icon={solid('pen-to-square')} /></Link>}
                <Link className="button" href={route('newsletter.view', { id: value })}><FontAwesomeIcon icon={solid('eye')} /></Link>
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
                <FontAwesomeIcon icon={solid('envelope-open')} className="pr-2" />
                Nuova email
            </Link>}
        </div>

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