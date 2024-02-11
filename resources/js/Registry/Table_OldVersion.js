// import { DataEditor, GridCellKind } from "@glideapps/glide-data-grid";
// import { AlumnusStatus } from "../Utils";
// import { usePage } from "@inertiajs/react";
// import "@glideapps/glide-data-grid/dist/index.css";

// export default function Table() {
//     // const alumni = usePage().props.alumni
//     // const tagsList = [...new Set( alumni.map( (i) => i.tags || [] ).flat() )];
//     // const tagsDict = {}
//     // tagsList.forEach( i => {
//     //     let letters = 1;
//     //     while( Object.values( tagsDict ).includes( i.substring(0,letters).toUpperCase() ) ) letters += 1;
//     //     tagsDict[i] = i.substring(0,letters).toUpperCase();
//     // });

//     const data = usePage().props.data

//     const columns = [
//         { title: 'ID', id: 'id', kind: GridCellKind.RowID, width: 50 },
//         { title: 'Nome', id: 'name', kind: GridCellKind.Text },
//         { title: 'Cognome', id: 'surname', kind: GridCellKind.Text },
//         { title: 'Stato', id: 'status', kind: 'status' },
//         { title: 'Coorte', id: 'coorte', kind: GridCellKind.Number, width: 80 },
//     ]

//     const getCell = ([col, row]) => {
//         const props = columns[col]
//         const content = props.id.split('.').reduce((data, key) => data[key], data[row])
//         if (props.kind == GridCellKind.RowID) return { kind: props.kind, data: content.toString() }
//         if (props.kind == GridCellKind.Text) return { kind: props.kind, data: content, displayData: content }
//         if (props.kind == GridCellKind.Number) return { kind: props.kind, data: content, displayData: content.toString() }
//         if (props.kind == 'status') return { kind: GridCellKind.Text, data: AlumnusStatus.status[content].label, displayData: "<span>" + AlumnusStatus.status[content].label + "</span>" }
//     }

//     console.log(data[0])


//     return (
//         <div className="main-container-drawer">
//             <DataEditor
//                 getCellContent={getCell}
//                 columns={columns}
//                 rows={data.length}
//                 height={"80vh"}
//                 width={"100%"}
//             />
//         </div>
//     );
// }