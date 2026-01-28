import { useMemo, useState } from 'react';
import Backdrop from '../Layout/Backdrop';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz, ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { Head, router, usePage } from '@inertiajs/react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default function VerifyCities() {

    const [loading,setLoading] = useState(false);

    const deleteCity = (id) => {
        setLoading(true)
        router.post(
            route('webmaster.delete_city'),
            { id: id },
            { onFinish: () => setLoading(false) }
        )
    }
    
    const regenerateCities = (id) => {
        setLoading(true)
        router.post(
            route('webmaster.renegerate_cities'),
            {},
            { onFinish: () => setLoading(false) }
        )
    }

    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 70, sortable: false },
        { field: 'name', headerName: 'Nome', sortable: false },
        { field: 'display_name', headerName: 'Nome visualizzato', sortable: false },
        { field: 'id', headerName: 'Cancella', width: 70, sortable: false, cellRenderer: ({ data }) => <button className='icon-button' onClick={() => deleteCity(data.id)}><FontAwesomeIcon icon={faTrash} /></button> },
    ], [])

    const cities = usePage().props.cities

    return <div className="main-container-large h-[80vh] gap-1">
        <Head title="Città" />
        <div className='w-full h-full flex flex-row'>
            <div className='w-1/2 h-full flex flex-col'>
                <div className='ag-theme-quartz w-full h-full'>
                    <AgGridReact
                        columnDefs={columns}
                        rowData={cities}
                        theme={themeQuartz} />
                </div>
                <div className="button" onClick={() => regenerateCities()}>Rigenera lista</div>
            </div>
            {cities.length > 0 &&
                <MapContainer center={[45, -11]} zoom={3} className='w-1/2 h-full'>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {cities.map(c =>
                        <Marker position={[c.lat, c.lng]} key={c.id}>
                            <Popup>
                                {c.display_name}
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            }
        </div>
        <Backdrop open={loading} />
    </div>
}