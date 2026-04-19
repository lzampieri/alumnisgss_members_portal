import { Head, Link, usePage } from "@inertiajs/react";

import { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { TextFilterModule, themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule } from 'ag-grid-community';
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel } from "../Utils";
import { faEnvelopeOpen, faEye, faPenToSquare, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule,TextFilterModule]);


export default function List() {

    console.log(usePage().props.list)

    const columns = [
        {
            field: 'go', headerName: '', valueGetter: ({ data }) => data.id, cellRenderer: ({ value, data }) => <>
                <Link className="button" href={route('mailinglist.edit', { ml: value })}><FontAwesomeIcon icon={faPenToSquare} /></Link>
            </>, flex: 1
        },
        {
            field: 'name', headerName: 'Nome', filter: 'agTextColumnFilter', flex: 1
        },
        {
            field: 'count', headerName: 'Indirizzi',
            valueGetter: ({ data }) => data?.list.length, filter: 'agTextColumnFilter', flex: 1
        },
        {
            field: 'canView', headerName: 'Visibile da', valueGetter: ({data}) => data.dynamic_permissions.filter((dp) => dp.type == 'view').map(dp => dp.role.common_name).join(", "), filter: 'agTextColumnFilter', flex: 1
        },
        {
            field: 'canEdit', headerName: 'Modificabile da', valueGetter: ({data}) => data.dynamic_permissions.filter((dp) => dp.type == 'edit').map(dp => dp.role.common_name).join(", "), filter: 'agTextColumnFilter', flex: 1
        }
    ]

    const [quickFilter, setQuickFilter] = useState('')

    return <div className="main-container-large">
        <Head title="Mailing list" />
        <div className="w-full flex flex-row gap-2 mb-1 items-start">
            <input type="text" className="grow" value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder="Filtra.../ Ancora non implementato" />
            {usePage().props.canCreate && <Link className="button mb-2 grow-0" href={route('mailinglist.edit')}>
                <FontAwesomeIcon icon={faTruckFast} className="pr-2" />
                Nuova lista
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
        <div className="w-full flex flex-row justify-end">
            <Link href={route('newsletters.listAll')}>Mostra tutte</Link>
        </div>
    </div>
}