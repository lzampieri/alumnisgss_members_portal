import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import { Link, usePage } from '@inertiajs/react';
import { AlumnusStatus } from "../Utils";
import { useMemo, useState } from 'react';
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RegistryHeader from './RegistryHeader';

function detailsValueGetter({ data, colDef }) {
    return data.details.find(i => (i.key == colDef.field))?.value;
}

export default function Table() {
    const data = usePage().props.data
    const detailsTitles = usePage().props.detailsTitles

    const columns = useMemo( () => [
        { field: 'id', headerName: 'ID', width: 100, cellRenderer: ({ value }) => <span className='text-gray-400'><Link className="icon-button" href={route('registry.edit', { alumnus: value })}><FontAwesomeIcon icon={solid('pen')} /></Link> {value}</span> },
        { field: 'name', headerName: 'Nome' },
        { field: 'surname', headerName: 'Cognome' },
        { field: 'coorte', headerName: 'Coorte', filter: 'agTextColumnFilter', width: 100 },
        { field: 'status', headerName: 'Stato', filter: 'agTextColumnFilter', filterValueGetter: ({ data }) => AlumnusStatus.status[data.status].label, cellRenderer: ({ data, value }) => <span><span style={{ color: AlumnusStatus.status[value].color }}>⬤</span> {AlumnusStatus.status[value].label}{data.pending_ratifications > 0 && <FontAwesomeIcon icon={solid('hourglass-half')} className='ml-2' />}</span> },
        { field: 'tags', headerName: 'Tags', valueGetter: ({ data }) => (data.tags || []).
        (', '), cellRenderer: ({ data }) => (data.tags || []).map((i, idx) => <span key={idx} className='bg-gray-100 border border-gray-300 rounded px-2 py-1'>{i}</span>) },
        ...detailsTitles.map(i => ({ field: i, headerName: i, valueGetter: detailsValueGetter }))
    ], [detailsTitles])

    const [quickFilter, setQuickFilter] = useState('')

    return <div className="main-container-large h-[80vh] gap-1">
        <RegistryHeader where='table' quickFilter={quickFilter} setQuickFilter={setQuickFilter} />
        <div className='ag-theme-quartz w-full grow'>
            <AgGridReact
                rowData={data}
                columnDefs={columns}
                quickFilterText={quickFilter} />
        </div>
    </div>
}