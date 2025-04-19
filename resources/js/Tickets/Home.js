import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@inertiajs/react";

import { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, InfiniteRowModelModule, ColumnAutoSizeModule, QuickFilterModule } from 'ag-grid-community';
import { bgAndContrast, bgAndContrastPastel } from "../Utils";
import { getStatusColor, getStatusLabel } from "./TktUtils";
ModuleRegistry.registerModules([InfiniteRowModelModule, ColumnAutoSizeModule, QuickFilterModule]);

function getNameAndSurname(guy) {
    let sur = guy?.surname || '';
    let nam = guy?.name || '';
    return sur + " " + nam;
}

function StatusChip({ value, commentsCount }) {
    return <div className="flex flex-row items-center justify-start text-sm h-full">
        <div className="px-1 grow-0 rounded" style={bgAndContrastPastel(getStatusColor(value))}>
            {getStatusLabel(value)}
        </div>
        {commentsCount > 0 &&
            <span className="text-gray-500 ml-1"><FontAwesomeIcon icon={solid('comment')} />{commentsCount}</span>
        }
    </div>
}

function ViewLink({ id }) {
    return id && <div className="flex flex-row items-center justify-start text-sm h-full">
        <Link href={route('ticket.view', { ticket: id })}>
            <FontAwesomeIcon icon={solid('eye')} className="icon-button p-2" />
        </Link>
    </div>
}


export default function Home() {

    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID' },
        { field: 'created_at', headerName: 'Data creazione', valueGetter: ({ data }) => new Date(data?.created_at).toLocaleString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' }), filter: 'agTextColumnFilter' },
        { field: 'author', headerName: 'Autore', valueGetter: ({ data }) => "" + getNameAndSurname(data?.author), filter: 'agTextColumnFilter' },
        { field: 'subject', headerName: 'Oggetto', valueGetter: ({ data }) => data?.instance?.subject, filter: 'agTextColumnFilter' },
        { field: 'status', headerName: 'Stato', cellRenderer: ({ data, value }) => <StatusChip value={value} commentsCount={data && data['comments_count']} />, filter: 'agTextColumnFilter' },
        { field: 'open', headerName: 'Apri', valueGetter: ({ data }) => data?.id, cellRenderer: ({ value }) => <ViewLink id={value} />, filter: 'agTextColumnFilter' },
    ], [])

    const [quickFilter, setQuickFilter] = useState('')

    const perPage = 30;

    let gridApi = null;

    const dataSource = useMemo(() => {
        return {
            rowCount: undefined,
            getRows: async (params) => {
                let page = Math.floor(params.startRow / perPage)
                let response = await fetch(route('helpdesk.list_getrows', { perPage: perPage, page: page }));
                if (response.ok) {
                    let data = await response.json();
                    params.successCallback(data.data, data.total)
                    gridApi?.autoSizeAllColumns();
                } else {
                    params.failCallback()
                }

            }
        }
    }, [])

    return <div className="main-container-large">
        <div className="w-full flex flex-row gap-2 mb-1 items-start">
            <input type="text" className="grow" value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder="Filtra.../ Ancora non implementato" />
            <Link className="button mb-2 grow-0" href={route('ticket.addList')}>
                <FontAwesomeIcon icon={solid('suitcase-medical')} className="pr-2" />
                Nuova richiesta
            </Link>
        </div>

        <div className="h-[80vh] w-full">
            <AgGridReact
                columnDefs={columns}
                quickFilterText={quickFilter}
                rowModelType='infinite'
                cacheBlockSize={perPage}
                datasource={dataSource}
                theme={themeQuartz}
                gridOptions={{
                    autoSizeStrategy: {
                        type: 'fitCellContents'
                    },
                    onGridReady: (params) => gridApi = params.api,
                }} />
        </div>
    </div>
}