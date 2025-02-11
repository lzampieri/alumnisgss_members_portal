import { Link, usePage } from '@inertiajs/react';
import { AlumnusStatus } from "../Utils";
import { useMemo, useState } from 'react';
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RegistryHeader from './RegistryHeader';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, QuickFilterModule, RowAutoHeightModule } from 'ag-grid-community';
import ADetailsType from '../Network/ADetailsType';
ModuleRegistry.registerModules([ClientSideRowModelModule, QuickFilterModule, RowAutoHeightModule]);

function adtValueGetter(data, adtId) {
    if (!data?.a_details_keyd)
        return
    if (!data.a_details_keyd[adtId])
        return
    return data.a_details_keyd[adtId];
}

function adtRenderer(adt, i) {
    if (!adt || adt.value.length == 0)
        return
    if (adt.a_details_type && adt.a_details_type?.type in ADetailsType.values)
        return ADetailsType.values[adt.a_details_type?.type].chip(adt, i)
    else
        return adt.value.map((entry, j) => <SmartChip
            content={entry}
            key={adt.id + "|" + j}
            style={bgAndContrastPastel(adt.a_details_type_id)} />
        )

}

function adtFilterValueGetter(data, adtId) {
    return JSON.stringify( adtValueGetter( data, adtId )?.value )?.toLowerCase();
}

export default function Table() {
    const data = usePage().props.data
    const adtlist = usePage().props.adtlist

    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 100, cellRenderer: ({ value }) => <span className='text-gray-400'><Link className="icon-button" href={route('registry.edit', { alumnus: value })}><FontAwesomeIcon icon={solid('pen')} /></Link> {value}</span> },
        { field: 'name', headerName: 'Nome' },
        { field: 'surname', headerName: 'Cognome' },
        { field: 'coorte', headerName: 'Coorte', filter: 'agTextColumnFilter', width: 100 },
        { field: 'status', headerName: 'Stato', filter: 'agTextColumnFilter', filterValueGetter: ({ data }) => AlumnusStatus.status[data.status].label, cellRenderer: ({ data, value }) => <span><span style={{ color: AlumnusStatus.status[value].color }}>⬤</span> {AlumnusStatus.status[value].label}{data.pending_ratifications > 0 && <FontAwesomeIcon icon={solid('hourglass-half')} className='ml-2' />}</span> },
        { field: 'tags', headerName: 'Tags', valueGetter: ({ data }) => (data.tags || []).join(', '), cellRenderer: ({ data }) => (data.tags || []).map((i, idx) => <span key={idx} className='bg-gray-100 border border-gray-300 rounded px-2 py-1'>{i}</span>) },
        ...adtlist.map(i => ({
            field: i.name, headerName: i.name, valueGetter: ({ data }) => adtValueGetter(data, i.id),
            cellRenderer: ({ value, instanceId }) => adtRenderer(value, instanceId),
            filterValueGetter: ({ data }) => adtFilterValueGetter(data, i.id),
            autoHeight: true
        }))
    ], [])

    const [quickFilter, setQuickFilter] = useState('')

    return <div className="main-container-large h-[80vh] gap-1">
        <RegistryHeader where='table' quickFilter={quickFilter} setQuickFilter={setQuickFilter} />
        <div className='ag-theme-quartz w-full grow'>
            <AgGridReact
                theme={themeQuartz}
                rowData={data}
                columnDefs={columns}
                quickFilterText={quickFilter} />
        </div>
    </div>
}