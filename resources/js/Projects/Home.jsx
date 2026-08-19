

import { Head, usePage } from "@inertiajs/react";

import { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { ClientSideRowModelModule, themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ColumnAutoSizeModule, QuickFilterModule } from 'ag-grid-community';
import { faCircle, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AlumnusStatus, romanize } from "../Utils";
import { NurDate } from "../Libs/DateEditor";
import ProjectDialog from "./ProjectDialog";
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule]);


export default function Home() {

    const [toEdit, setToEdit] = useState(null);
    const [quickFilter, setQuickFilter] = useState('');

    const columns = useMemo(() => [
        { field: 'running', headerName: '', cellRenderer: ({ value, data }) => <FontAwesomeIcon icon={faCircle} style={{ color: (data.running ? "green" : ( data.open ? "orange" : "red")) }} /> },
        { field: 'title', headerName: 'Titolo', filter: 'agTextColumnFilter' },
        { field: 'from', headerName: 'Dal', cellRenderer: ({ value }) => new NurDate(value).toNiceString() },
        { field: 'to', headerName: 'Al', cellRenderer: ({ value }) => new NurDate(value).toNiceString() },
        { field: 'id', headerName: 'Azioni', cellRenderer: ({ value, data }) => <div className="flex flex-row ">
            {data.can_edit && <div className="icon-button" onClick={() => setToEdit(data)}><FontAwesomeIcon icon={faPencil} /></div>}
        </div> },
    ], [])

    return <div className="main-container-large">
        <Head title="Progetti" />
        <div className="w-full flex flex-row gap-2 mb-1 items-end">
            <ProjectDialog toEdit={toEdit} setToEdit={setToEdit} />
            <input className="input grow" placeholder="Cerca..." value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} />
            <div className="flex flex-col">
                <span className="text-xs"><FontAwesomeIcon icon={faCircle} style={{ color: "green" }} /> Aperto</span>
                <span className="text-xs"><FontAwesomeIcon icon={faCircle} style={{ color: "orange" }} /> Solo rimborsi</span>
                <span className="text-xs"><FontAwesomeIcon icon={faCircle} style={{ color: "red" }} /> Chiuso</span>
            </div>
        </div>
        <div className="h-[80vh] w-full">
            <AgGridReact
                columnDefs={columns}
                rowData={usePage().props.projects}
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