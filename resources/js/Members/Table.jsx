import { Head, Link, usePage } from '@inertiajs/react';
import { AlumnusStatus, bgAndContrastPastel } from "../Utils";
import { useMemo, useState } from 'react';


import RegistryHeader from './RegistryHeader';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, QuickFilterModule, RowAutoHeightModule } from 'ag-grid-community';
import ADetailsType from '../Network/ADetailsType';
import SmartChip from '../Network/SmartChip';
import { faHourglass, faHourglassHalf, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
        return ADetailsType.values[adt.a_details_type?.type].chip(adt, adt.a_details_type, i)
    else
        return adt.value.map((entry, j) => <SmartChip
            content={entry}
            key={adt.id + "|" + j}
            style={bgAndContrastPastel(adt.a_details_type_id)} />
        )
}

function adtFilterValueGetter(data, adtId) {
    return JSON.stringify(adtValueGetter(data, adtId)?.value)?.toLowerCase();
}

export default function Table() {
    const data = usePage().props.data
    const adtlist = usePage().props.adtlist

    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 100, cellRenderer: ({ value }) => <span className='text-gray-400'><Link className="icon-button" href={route('person.edit', { person: value })}><FontAwesomeIcon icon={faPen} /></Link> {value}</span> },
        { field: 'name', headerName: 'Nome' },
        { field: 'surname', headerName: 'Cognome' },
        { field: 'coorte', headerName: 'Coorte', filter: 'agTextColumnFilter', width: 100 },
        { field: 'status', headerName: 'Stato', filter: 'agTextColumnFilter', filterValueGetter: ({ data }) => AlumnusStatus.status[data.status].label, cellRenderer: ({ data, value }) => <span><span style={{ color: AlumnusStatus.status[value].color }}>⬤</span> {AlumnusStatus.status[value].label}{data.pending_ratifications_count > 0 && <FontAwesomeIcon icon={faHourglassHalf} className='ml-2' />}</span> },
        { field: 'tags', headerName: 'Tags', valueGetter: ({ data }) => (data.tags || []).join(', '), cellRenderer: ({ data }) => (data.tags || []).map((i, idx) => <span key={idx} className='bg-gray-100 border border-gray-300 rounded px-2 py-1'>{i}</span>) },
        {
            field: 'consents', headerName: 'Consensi',
            valueGetter: ({ data }) => "" + data.consent_to_email_share + data.consent_to_network_share,
            cellRenderer: ({ data }) => <div className="flex flex-row justify-start align-middle">
                <SmartChip content="Mail" style={bgAndContrastPastel(data.consent_to_email_share ? 4 : 2)} />
                <SmartChip content="Dettagli" style={bgAndContrastPastel(data.consent_to_network_share ? 4 : 2)} />
            </div>
        },
        ...adtlist.map(i => ({
            field: i.name, headerName: i.name, valueGetter: ({ data }) => adtValueGetter(data, i.id),
            cellRenderer: ({ value, instanceId }) => adtRenderer(value, instanceId),
            filterValueGetter: ({ data }) => adtFilterValueGetter(data, i.id),
            autoHeight: true
        }))
    ], [])

    const [quickFilter, setQuickFilter] = useState('')

    return <div className="main-container-large h-[80vh] gap-1">
        <Head title="Anagrafe" />
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