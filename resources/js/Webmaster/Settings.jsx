import { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz, ModuleRegistry, ClientSideRowModelModule, NumberEditorModule, TextEditorModule, ColumnAutoSizeModule } from 'ag-grid-community';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSave } from '@fortawesome/free-solid-svg-icons';
ModuleRegistry.registerModules([ClientSideRowModelModule, NumberEditorModule, TextEditorModule, ColumnAutoSizeModule]);
import Backdrop from "../Layout/Backdrop";

export default function Settings() {

    const { data, setData, processing, post, errors } = useForm({
        settings: [
            ...usePage().props.settings,
            { key: '', value: '' }
        ]
    })

    const columns = useMemo(() => [
        { field: 'key', headerName: 'Nome', sortable: false, editable: true, flex: 1, cellDataType: 'text' },
        { field: 'value', headerName: 'Valore', sortable: false, editable: true, flex: 1, cellDataType: 'text' },
    ], [])

    const onCellEditRequest = ({ column, rowIndex, newValue }) => {
        let newData = data.settings.slice();
        if (rowIndex == newData.length - 1) {
            newData.push({ key: '', value: '' });
        }
        newData[rowIndex][column.colDef.field] = newValue;
        setData('settings', newData);
    }

    const submit = (e) => {
        e.preventDefault();
        post(route('webmaster.settings'), { preserveState: "errors" });
    }

    return <div className="main-container-large h-[80vh] gap-1">
        <Head title="Parametri e impostazioni" />
        <div className="w-full flex flex-row justify-between mt-4 gap-2" >
            <div onClick={() => window.history.back()} className='button'>
                <FontAwesomeIcon icon={faChevronLeft} />
                Indietro
            </div>
            <div className='button' onClick={submit}>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Salva
            </div>
        </div >
        {errors && Object.keys(errors).length > 0 && <label className="error">{JSON.stringify(errors)}</label>}
        <div className='ag-theme-quartz w-full grow'>
            <AgGridReact
                theme={themeQuartz}
                rowData={data.settings}
                columnDefs={columns}
                singleClickEdit={true}
                onCellEditRequest={onCellEditRequest}
                readOnlyEdit={true}
            />
        </div>
        <Backdrop open={processing} />
    </div>
}