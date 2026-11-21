import { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz, ModuleRegistry, ClientSideRowModelModule, ColumnAutoSizeModule } from 'ag-grid-community';
import { Head, usePage } from '@inertiajs/react';
import BlockParser from '../../Blocks/BlockParser';
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule]);

export default function Responses() {

    const resource = usePage().props.resource;
    const responses = useMemo(() => resource.responses.map((r) => { return { ...r, ...JSON.parse(r.data) } }), [resource])


    const columns = useMemo(() => [
        { field: 'date', headerName: 'Data', valueGetter: ({ data }) => new Date(data?.created_at).toLocaleString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }), sortable: true },
        ...JSON.parse(resource.content).filter((f) => BlockParser.isForm(f)).map((f) => {
            return {
                field: f.id, headerName: f.title
            }
        })
    ], [])

    return <div className="main-container-large h-[80vh] gap-1">
        <Head title={"Risposte al form " + resource.id} />
        <div className='flex flex-row w-full'>
            <h1 className='grow'>{resource.title}</h1>
            <a href={route('resources.responses.xlsx',{resource:resource.id})} className='button'>Scarica come Excel</a>
        </div>
        <div className='ag-theme-quartz w-full grow'>
            <AgGridReact
                columnDefs={columns}
                rowData={responses}
                theme={themeQuartz} />
        </div>
    </div>
}