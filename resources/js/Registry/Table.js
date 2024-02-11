import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import { Link, usePage } from '@inertiajs/react';
import { AlumnusStatus } from "../Utils";
import { useState } from 'react';
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function detailsValueGetter({ data, colDef }) {
    return data.details.find(i => (i.key == colDef.field))?.value;
}

export default function Table() {
    const data = usePage().props.data
    const detailsTitles = usePage().props.detailsTitles

    const columns = [
        { field: 'id', headerName: 'ID', width: 100, cellRenderer: ({ value }) => <span className='text-gray-400'><Link className="icon-button" href={route('registry.edit', { alumnus: value })}><FontAwesomeIcon icon={solid('pen')} /></Link> {value}</span> },
        { field: 'name', headerName: 'Nome' },
        { field: 'surname', headerName: 'Cognome' },
        { field: 'coorte', headerName: 'Coorte', width: 100 },
        { field: 'status', headerName: 'Stato', filterValueGetter: ({ data }) => AlumnusStatus.status[data.status].label, cellRenderer: ({ data, value }) => <span><span style={{ color: AlumnusStatus.status[value].color }}>⬤</span> {AlumnusStatus.status[value].label}{data.pending_ratifications > 0 && <FontAwesomeIcon icon={solid('hourglass-half')} className='ml-2' />}</span> },
        { field: 'tags', headerName: 'Tags', valueFormatter: ({ data }) => data.tags.join(', '), cellRenderer: ({ data }) => data.tags.map((i, idx) => <span key={idx} className='bg-gray-100 border border-gray-300 rounded px-2 py-1'>{i}</span>) },
        ...detailsTitles.map(i => ({ field: i, headerName: i, valueGetter: detailsValueGetter }))
    ]

    const [quickFilter, setQuickFilter] = useState('')

    return <div className="w-full h-[80vh] flex flex-col">
        <div className='w-full flex flex-row-reverse'>
            <input type='text' value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder='Cerca...' className='w-1/3' />
        </div>
        <div className='ag-theme-quartz w-full grow'>
            <AgGridReact
                rowData={data}
                columnDefs={columns}
                quickFilterText={quickFilter} />
        </div>
    </div>
}