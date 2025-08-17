import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { APIProvider, useMapsLibrary, Map as GoogleMap, Marker, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useMemo, useRef, useState } from "react";


export default class Map {
    static title = "Mappa"
    static icon = solid('map')

    static getDefaultData() {
        return {
            'places': [],
            // 'imageHandle': null,
            // 'imageSize': 'small' // small-medium-large
        }
    }

    static mainElementEditable = ({ item, setItemValue, dndContextId }) => {
        return <div
            className="w-full div-highlighted flex flex-col items-center gap-4 my-2 p-4 !cursor-auto"
            data-rbd-drag-handle-context-id={dndContextId}
            data-rbd-drag-handle-draggable-id="gibberish"
        >
            <APIProvider apiKey={process.env.MIX_PUBLIC_MAPS_API_KEY}
                version={'beta'}>
                <GoogleMap
                    mapId={'fadojnfkasdnlk'}
                    defaultZoom={13}
                    defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
                    streetViewControl={false}
                    fullscreenControl={false}
                    className="w-full aspect-video">
                    <MapMarkers places={item.places} />
                </GoogleMap>
                <AutocompleteElement addPlace={(newPlace) => setItemValue('places', [...item.places, newPlace])} />
                <KnownLocations places={item.places} setPlaces={(newPlaces) => setItemValue('places', newPlaces)} />
            </APIProvider>
        </div>
    }

    static mainElementReadOnly = ({ item }) => {
        return <div
            className="w-full flex flex-col items-center gap-4 my-2 p-4"
        >
            <APIProvider apiKey={process.env.MIX_PUBLIC_MAPS_API_KEY}
                version={'beta'}>
                <GoogleMap
                    mapId={'fadojnfkasdnlk'}
                    defaultZoom={13}
                    defaultCenter={{ lat: 45.407197, lng: 11.880255 }}
                    className="w-full aspect-video">
                    <MapMarkers places={item.places} />
                </GoogleMap>
            </APIProvider>
        </div>
    }
}

function AutocompleteElement({ addPlace }) {
    const places = useMapsLibrary("places");
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.addEventListener("gmp-select", (ev) => addPlace(ev.placePrediction.toPlace().id));
        }
    }, [ref]);

    return <><gmp-place-autocomplete
        ongmp-select={(ev) => console.log("Selezionato!")}
        ongmp-placeselect={(ev) => console.log("Selezionato!")}
        placeholder={"Aggiungi un indirizzo..."}
        class="w-full max-w-full"
        ref={ref}
    /></>
}

function MapMarkers({ places }) {
    const placesLib = useMapsLibrary("places");
    const [placesDets, setPlacesDets] = useState([]);
    const map = useMap();

    useEffect(() => {
        async function fetchAndSet() {
            if (placesLib) {
                let placesDet = await Promise.all(places.map(async p => {
                    let pd = new google.maps.places.Place({ id: p, requestedLanguage: 'it' });
                    await pd.fetchFields({ fields: ['location'] })
                    return pd
                }));
                let bounds = new google.maps.LatLngBounds();
                placesDet.forEach((p) => p.location && bounds.extend(p.location));
                if( placesDet.length == 0 ) 
                    bounds.extend({ lat: 45.407197, lng: 11.880255 });
                setPlacesDets(placesDet)
                map.fitBounds(bounds);
                if (map.getZoom() > 14) map.setZoom(14);
            }
        }
        fetchAndSet();
    }, [places, placesLib]);

    return <>
        {placesDets.map(p => <AdvancedMarker position={p.location} key={p.id}><Pin /></AdvancedMarker>)}
    </>
}

function KnownLocations({ places, setPlaces }) {
    const placesLib = useMapsLibrary("places");
    const [placesDets, setPlacesDets] = useState([]);

    useEffect(() => {
        async function fetchAndSet() {
            if (placesLib) {
                let placesDet = await Promise.all(places.map(async p => {
                    let pd = new google.maps.places.Place({ id: p, requestedLanguage: 'it' });
                    await pd.fetchFields({ fields: ['displayName'] })
                    return pd
                }));
                setPlacesDets(placesDet)
            }
        }
        fetchAndSet();
    }, [places, placesLib]);

    return <>
        {placesDets.map((p, idx) =>
            <div className="w-full" key={p.id}>
                <FontAwesomeIcon icon={solid('trash')} className="icon-button mr-2" onClick={() => setPlaces(places.toSpliced(idx, 1))} />
                {p.displayName}
            </div>
        )}
    </>
}