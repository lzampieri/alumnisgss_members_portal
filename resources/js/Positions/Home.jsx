

import { Head, usePage } from "@inertiajs/react";

import { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { ClientSideRowModelModule, themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ColumnAutoSizeModule, QuickFilterModule } from 'ag-grid-community';
import { faCircle, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PositionDialog from "./PositionDialog";
import { AlumnusStatus, romanize } from "../Utils";
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule]);


export default function Home() {

    const [toEdit, setToEdit] = useState(null);
    const [quickFilter, setQuickFilter] = useState('');

    const columns = useMemo(() => [
        { field: 'valid', headerName: '', cellRenderer: ({ value }) => <FontAwesomeIcon icon={faCircle} style={{ color: value ? "green" : "red" }} /> },
        {
            field: 'owner', headerName: 'Identità', valueGetter: ({ data }) => "" + data?.owner?.name + " " + data?.owner?.surname, cellRenderer: ({ data, value }) => {
                return <span>{data?.owner.surname} {data?.owner.name} <span className="text-gray-400">({romanize(data?.owner.coorte)}) - {data?.owner.coorte > 0 ? AlumnusStatus.status[data?.owner.status]?.label : data?.owner.notes}</span></span>
            }, filter: 'agTextColumnFilter'
        },
        { field: 'type', headerName: 'Tipo', filter: 'agTextColumnFilter' },
        { field: 'note', headerName: 'Note', filter: 'agTextColumnFilter' },
        { field: 'from', headerName: 'Dal', cellRenderer: ({ value }) => new Date(value).toLocaleDateString('it',{  year: 'numeric', month: '2-digit', day: '2-digit'}) },
        { field: 'to', headerName: 'Al', cellRenderer: ({ value }) => new Date(value).toLocaleDateString('it',{  year: 'numeric', month: '2-digit', day: '2-digit'}) },
        { field: 'id', headerName: 'Modifica', cellRenderer: ({ value, data }) => <div className="icon-button" onClick={() => setToEdit(data)}><FontAwesomeIcon icon={faPencil} /></div> },
    ], [])
    
    return <div className="main-container-large">
        <Head title="Incarichi" />
        <div className="w-full flex flex-row gap-2 mb-1 items-end">
            {usePage().props.canEdit && <PositionDialog toEdit={toEdit} setToEdit={setToEdit} />}
            <input className="input grow" placeholder="Cerca..." value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} />
        </div>
        <div className="h-[80vh] w-full">
            <AgGridReact
                columnDefs={columns}
                rowData={usePage().props.positions}
                quickFilterText={quickFilter}
                theme={themeQuartz}
                gridOptions={{
                    autoSizeStrategy: {
                        type: 'fitCellContents'
                    },
                }} />
        </div>
    </div>
}