import { useForm, usePage } from "@inertiajs/react";
import { AlumnusStatus } from "../Utils";
import Select from 'react-select';
import { useMemo, useState } from "react";
import Backdrop from "../Layout/Backdrop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, NumberEditorModule, TextEditorModule, ValidationModule } from 'ag-grid-community';
import { enqueueSnackbar } from "notistack";
import { transform } from "lodash";
ModuleRegistry.registerModules([ClientSideRowModelModule, NumberEditorModule, TextEditorModule, ValidationModule]);

export default function Bulk() {
    const { data, setData, post, processing, errors, transform } = useForm({
        status: 'not_reached',
        rows: [{ name: '', surname: '', coorte: 0 }]
    })

    // Stato
    const status_notRat = usePage().props.noRatStatus;
    const status_options = usePage().props.allStatus.map(i => {
        return {
            value: i,
            label: AlumnusStatus.status[i].label,
            noRat: status_notRat.includes(i)
        }
    })
    const formatOptionLabel = (data) => (
        <div className="flex flex-row items-center gap-2">
            {!data.noRat && <FontAwesomeIcon icon={solid('lock')} />}
            <div>{data.label}</div>
        </div>
    );

    const columns = useMemo(() => [
        { field: 'name', headerName: 'Nome', cellDataType: 'text', editable: true, sortable: false },
        { field: 'surname', headerName: 'Cognome', cellDataType: 'text', editable: true, sortable: false },
        { field: 'coorte', headerName: 'Coorte', cellDataType: 'number', editable: true, sortable: false },
    ], [])

    // const [rows, setRows] = useState([
    //     { name: '', surname: '', coorte: 0 },
    // ])

    transform(( data ) => {
        return {
            status: data.status,
            rows: data.rows.slice(0,-1)
        }
    })


    const submit = (e) => {
        e.preventDefault();
        // setData('rows', rows)
        post(route('registry.addBulk'), { preserveState: "errors", onError: () => enqueueSnackbar('C\'è stato un errore, verifica tutti i campi', { variant: 'error' }) });
    }


    const saveData = ({rowIndex,api}) => {
        if (rowIndex == data.rows.length - 1) {
            let storingFocusedCell = api.getFocusedCell();
            let storingEditingCell = api.getEditingCells();
            if (storingEditingCell.length > 0)
                api.stopEditing();

            setData('rows', [...data.rows, { name: '', surname: '', coorte: 0 }])

            api.setFocusedCell(storingFocusedCell.rowIndex, storingFocusedCell.column)
            if (storingEditingCell.length > 0) {
                setTimeout(() => { api.startEditingCell({ rowIndex: storingEditingCell[0].rowIndex, colKey: storingEditingCell[0].column }) }, 0)
            }
        }
    }

    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <div className="w-full justify-between flex flex-row">
                <h3>Inserimento in massa di {data.rows.length} alunni</h3>
                <div className="button flex flex-row items-center" onClick={submit}>
                    <FontAwesomeIcon icon={solid('save')} />
                    Salva
                </div>
            </div>

            <label>Stato</label>
            <Select
                classNames={{ control: () => 'selectDropdown' }}
                value={status_options.find(i => i.value == data.status)}
                onChange={(sel) => setData('status', sel.value)}
                options={status_options}
                formatOptionLabel={formatOptionLabel} />
            {
                !status_options.find(i => i.value == data.status)?.noRat && <div className="w-full alert">
                    <FontAwesomeIcon icon={solid('lock')} className="mr-2" />
                    Per il passaggio allo stato di {AlumnusStatus.status[data.status].label} è richiesta la ratifica al consiglio di amministrazione. Il passaggio non sarà immediato, ma al salvataggio verrà temporaneamente assegnato lo stato di <i>Non raggiunto</i> e creata una richiesta di ratifica.
                </div>
            }
            <label className="error">{errors.status}</label>

            <label>Dati da aggiungere</label>
            <label className="error">{Object.keys(errors).reduce((acc, key) => acc + ( key.startsWith('rows') ? errors[key] : '' ), '')}</label>
            <div className="h-[70vh]">
                <AgGridReact
                    theme={themeQuartz}
                    rowData={data.rows}
                    columnDefs={columns}
                    singleClickEdit={true}
                    onCellValueChanged={saveData} />
            </div>

            <div className="button flex flex-row items-center self-end my-4" onClick={submit}>
                <FontAwesomeIcon icon={solid('save')} />
                Salva
            </div>

            <Backdrop open={processing} />
        </form>
    );
}