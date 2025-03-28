import { useMemo, useState } from 'react';
import Tooltip from '../Layout/Tooltip';
import BigTooltip from '../Layout/BigTooltip';
import { Stringifier, Tooltipier } from './Stringifier';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, InfiniteRowModelModule } from 'ag-grid-community';
ModuleRegistry.registerModules([InfiniteRowModelModule]);


function AgentTooltip({ data, value }) {
    return <Tooltip content={
        <div>
            {data?.agent_type} <br />
            #{data?.agent_id}
        </div>
    }>
        {value?.name} {value?.surname}
    </Tooltip>
}

function ItemTooltip({ data, value }) {
    return <Tooltip content={
        <div>
            {Tooltipier( data?.item_type, data?.item )}
        </div>
    }>
        {Stringifier( data?.item_type, data?.item )}
    </Tooltip>
}

function NewValueTooltip({ data, value }) {
    if( value?.length < 25 ) return <div>{value}</div>
    return <BigTooltip content={
        <div>
            {value}
        </div>
    }>
        {value}
    </BigTooltip>
}

export default function InternalLog() {

    document.body.style.overflow = "hidden"

    const columns = useMemo(() => [
        { field: 'id', headerName : 'ID', width: 70 },
        { field: 'date', headerName: 'Data', valueGetter: ({ data }) => new Date(data?.created_at).toLocaleString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
        { field: 'agent', headerName: 'Agent', valueGetter: ({ data }) => data?.agent, cellRenderer: ({ data, value }) => <AgentTooltip data={data} value={value} /> },
        { field: 'item', headerName: 'Item', valueGetter: ({ data }) => data?.item, cellRenderer: ({ data, value }) => <ItemTooltip data={data} value={value} /> },
        { field: 'type', headerName: 'Type' },
        { field: 'field', headerName: 'Field' },
        { field: 'old_value', headerName: 'Old Value' },
        { field: 'new_value', headerName: 'New Value', cellRenderer: ({ data, value }) => <NewValueTooltip data={data} value={value} /> },
    ], [])

    const [quickFilter, setQuickFilter] = useState('')

    const perPage = 30;

    const dataSource = useMemo(() => {
        return {
            rowCount: undefined,
            getRows: async (params) => {
                let page = Math.floor(params.startRow / perPage)
                let response = await fetch(route('webmaster.log.internal.getrows', { perPage: perPage, page: page }));
                if (response.ok) {
                    let data = await response.json();
                    params.successCallback(data.data, data.total)
                } else {
                    params.failCallback()
                }

            }
        }
    }, [])

    return <div className="main-container-large h-[80vh] gap-1">
        <div className='ag-theme-quartz w-full grow'>
            <AgGridReact
                columnDefs={columns}
                quickFilterText={quickFilter}
                rowModelType='infinite'
                cacheBlockSize={perPage}
                datasource={dataSource}
                theme={themeQuartz} />
        </div>
    </div>
}