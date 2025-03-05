import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel, romanize } from "../Utils";
import { useMemo, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import SmartChip from "./SmartChip";

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, RowAutoHeightModule, QuickFilterModule } from 'ag-grid-community';
import ADetailsType from "./ADetailsType";
ModuleRegistry.registerModules([ClientSideRowModelModule, RowAutoHeightModule, QuickFilterModule]);

function AlumnusContent({ data }) {

    return <div className="w-full border border-primary-main flex flex-col p-2 min-h-[3rem] justify-center gap-2 leading-normal	">
        <div className="w-full flex flex-row items-center">
            <div className="ml-2 font-bold">
                {data.name} {data.surname}
            </div>
            {usePage().props.canEditAlumnus &&
                <div className="grow text-end mx-1">
                    <Link className="icon-button" href={route('network.edit', { alumnus: data.id })}><FontAwesomeIcon icon={solid('pen')} /></Link>
                </div>
            }
        </div>
        <div className="w-full flex flex-row justify-start flex-wrap">
            <SmartChip style={bgAndContrast(AlumnusStatus.status[data.status].color)} key='status' content={AlumnusStatus.status[data.status].label} />
            <SmartChip style={bgAndContrastPastel(-1)} key='coorte' content={(data.coorte > 0) ? (romanize(data.coorte) + " coorte") : "Onorario"} />
        </div>
        <div className="w-full flex flex-row justify-start flex-wrap gap-y-2">
            {data.a_details?.map((adt, i) => {
                if (adt.value.length > 0) {
                    if (adt.a_details_type && adt.a_details_type?.type in ADetailsType.values)
                        return ADetailsType.values[adt.a_details_type?.type].chip(adt, i)
                    else
                        return adt.value.map((entry, j) => <SmartChip
                            content={entry}
                            key={adt.id + "|" + j}
                            style={bgAndContrastPastel(adt.a_details_type_id)} />
                        )
                }
            }
            )}
        </div>
    </div>
}


function ListAsATable({ alumni, quickFilter }) {

    const theme = themeQuartz.withParams({
        headerHeight: 0,
        rowBorder: false,
        rowHoverColor: "#00000000",
        borderColor: "#00000000",
    })

    const columns = useMemo(() => [
        {
            field: 'main',
            cellRenderer: ({ value }) =>
                <AlumnusContent data={value} />,
            filter: 'agTextColumnFilter',
            filterValueGetter: ({ data }) => JSON.stringify(data),
            valueGetter: ({ data }) => data,
            autoHeight: true,
            flex: 1
        },
    ], [])

    return <div className='ag-theme-quartz w-full md:w-3/5 grow'>
        <AgGridReact
            rowData={alumni}
            columnDefs={columns}
            quickFilterText={quickFilter}
            theme={theme}
            suppressCellFocus={true}
        />
    </div>
}

export default function List() {
    const alumni = usePage().props.alumni;
    const [quickFilter, setQuickFilter] = useState('')
    console.log(alumni)

    return <div className="main-container-large h-[80vh] gap-1">
        <div className="w-full flex flex-row justify-center gap-2">
            <input className="w-full md:w-1/2" type='text' value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder='Cerca...' />
            {usePage().props.canEditView &&
                <Link className="button flex flex-row items-baseline" href={route('network.settings')}>
                    <FontAwesomeIcon icon={solid('gear')} />
                    Impostazioni
                </Link>
            }
        </div>
        <ListAsATable alumni={alumni} quickFilter={quickFilter} />
    </div>
}
