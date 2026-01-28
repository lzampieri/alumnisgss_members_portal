
import { faChartColumn } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useMemo, useState } from "react";

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { ColumnAutoSizeModule, themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, NumberEditorModule, TextEditorModule, ValidationModule } from 'ag-grid-community';
import { Bar } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart, LinearScale, Tooltip } from "chart.js";
import ReactSwitch from "react-switch";
ModuleRegistry.registerModules([ClientSideRowModelModule, NumberEditorModule, TextEditorModule, ValidationModule, ColumnAutoSizeModule]);

import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(LinearScale, CategoryScale, BarElement, Tooltip, ChartDataLabels);

const colors = {
    'b': '#1f77b4',
    'a': '#ff7f0e',
    'v': '#2ca02c',
    'r': '#d62728',
    'l': '#9467bd',
    'm': '#8c564b',
    'p': '#e377c2',
    'g': '#7f7f7f',
    'o': '#bcbd22',
    'c': '#17becf'
}

function BarChartDrawer({ data, horiz, stacked, show_labels }) {
    const options = {};
    if( horiz ) {
        options['scales'] = { x: { beginAtZero: true, stacked: stacked }, y: { stacked: stacked } }
        options['indexAxis'] = 'y';
    }
    else {
        options['scales'] = { y: { beginAtZero: true, stacked: stacked }, x: { stacked: stacked } }
        options['indexAxis'] = 'x';
    }

    options['plugins'] = { datalabels: { display: show_labels, anchor: 'end', align: 'end' } }

    const labels = data.map(d => d.x).filter((v,i,a) => a.indexOf(v) === i)
    const datasets_ids = data.map(d => d.ds).filter((v,i,a) => a.indexOf(v) === i)
    const datasets = datasets_ids.map(ds => { return {
        label: ds,
        data: labels.map(l => undefined),
        backgroundColor: labels.map(l => undefined),
    }})
    data.forEach( v => { datasets[datasets_ids.indexOf(v.ds)].data[labels.indexOf(v.x)] = v.h; datasets[datasets_ids.indexOf(v.ds)].backgroundColor[labels.indexOf(v.x)] = colors[v.color] || colors['b'] } )

    const parsed_data = {
        labels:labels,
        datasets: datasets
    };

    return <Bar options={options} data={parsed_data} />
}

export default class BarChart {
    static title = "Istogramma"
    static icon = faChartColumn

    static getDefaultData() {
        return {
            data: [
                { ds: 'Dati', x: "Uno", h: 12, color: "r" },
                { ds: 'Dati', x: "Due", h: 8, color: "r" },
                { ds: 'Dati', x: "Tre", h: 22, color: "r" },
            ],
            horiz: false, stacked: false, show_labels: true
        }
    }

    static getEmptyData() {
        return { x: "", h: 0, color: "r" }
    }

    static mainElementEditable = ({ item, setItemValue }) => {

        const onCellEditRequest = ({ column, rowIndex, newValue }) => {
            let data = item.data.slice();
            if (rowIndex == data.length) {
                data.push(BarChart.getEmptyData());
            }
            data[rowIndex][column.colDef.field] = newValue;
            setItemValue('data', data);
        }

        const columns = useMemo(() => [
            { field: 'ds', headerName: 'Dataset', cellDataType: 'text', editable: true, sortable: false, flex: 1 },
            { field: 'x', headerName: 'Etichette', cellDataType: 'text', editable: true, sortable: false, flex: 1 },
            { field: 'h', headerName: 'Valore', cellDataType: 'number', editable: true, sortable: false, flex: 1 },
            { field: 'color', headerName: 'Colore', cellDataType: 'text', editable: true, sortable: false, flex: 1 },
        ], [])

        const getRowId = useCallback((params) => String(params.data.id), []);

        return <div className="w-full flex flex-col">
            <h2 className="font-bold text-primary-main text-xl">Istogramma</h2>
            <div className="flex flex-row">
                {Object.keys(colors).map(k =>
                    <div className="block aspect-square w-[1rem] text-center" style={{ backgroundColor: colors[k] }} key={k}>{k}</div>
                )}
            </div>
            <div className="h-[70vh] w-full">
                <AgGridReact
                    theme={themeQuartz}
                    rowData={[...item.data.map((v, i) => ({ ...v, id: i })), { id: item.data.length }]}
                    columnDefs={columns}
                    singleClickEdit={true}
                    onCellEditRequest={onCellEditRequest}
                    readOnlyEdit={true}
                    getRowId={getRowId}
                />
            </div>
            <div className="flex flex-row">
                Orientamento:
                <ReactSwitch
                    height={14} width={28} className="m-2"
                    checked={item.horiz} onChange={(newState) => setItemValue('horiz', newState)}
                />
                Impilati:
                <ReactSwitch
                    height={14} width={28} className="m-2"
                    checked={item.stacked} onChange={(newState) => setItemValue('stacked', newState)}
                />
                Etichette:
                <ReactSwitch
                    height={14} width={28} className="m-2"
                    checked={item.show_labels} onChange={(newState) => setItemValue('show_labels', newState)}
                />
            </div>
            <BarChartDrawer {...item} />
        </div>
    }

    static mainElementReadOnly = ({ item }) => {
        return <BarChartDrawer {...item} />
    }
}