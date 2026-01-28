

import { Head, usePage } from "@inertiajs/react";

import { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { ClientSideRowModelModule, themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ColumnAutoSizeModule, QuickFilterModule } from 'ag-grid-community';
import { faCircle, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NewPositionDialog from "./NewPositionDialog";
import { AlumnusStatus, romanize } from "../Utils";
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule]);


export default function Home() {

    const [toEdit, setToEdit] = useState(null);

    const columns = useMemo(() => [
        { field: 'valid', headerName: '', valueGetter: ({ data }) => (new Date(data?.from) < new Date() && new Date(data?.to) > new Date()), cellRenderer: ({ value }) => <FontAwesomeIcon icon={faCircle} style={{ color: value ? "green" : "red" }} /> },
        {
            field: 'owner', headerName: 'Identità', valueGetter: ({ data }) => "" + data?.owner?.name + " " + data?.owner?.surname, cellRenderer: ({ data, value }) => {
                return data?.owner_type.endsWith("Alumnus") ?
                    <span>{data?.owner.surname} {data?.owner.name} <span className="text-gray-400">({romanize(data?.owner.coorte)}) - {AlumnusStatus.status[data?.owner.status]?.label}</span></span> :
                    <span>{data?.owner.surname} {data?.owner.name} <span className="text-gray-400 small">({data?.owner.notes})</span></span>
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
            {usePage().props.canEdit && <NewPositionDialog toEdit={toEdit} setToEdit={setToEdit} />}
        </div>
        <div className="h-[80vh] w-full">
            <AgGridReact
                columnDefs={columns}
                rowData={usePage().props.positions}
                // quickFilterText={quickFilter} TODO
                // rowModelType='infinite'
                // cacheBlockSize={perPage}
                // datasource={dataSource}
                theme={themeQuartz}
                gridOptions={{
                    autoSizeStrategy: {
                        type: 'fitCellContents'
                    },
                }} />
        </div>
    </div>
}