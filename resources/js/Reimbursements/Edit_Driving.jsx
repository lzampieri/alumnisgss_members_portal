

// todo bisogna limitare le date al progetto!

import { Component, memo, useEffect, useState } from "react";
import { NurDate, NurDatePicker } from "../Libs/DateEditor";
import { usePage } from "@inertiajs/react";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp, faSpinner, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { noninertiaPostRequest } from "../Utils";
import Backdrop from "../Layout/Backdrop";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { ExpensesErrorDiv } from "./Edit_ErrorDiv";
import SmartSelect from "../Libs/SmartSelect";

function delFromArray(arr, idx) {
    const newarr = arr.toSpliced(idx, 1)
    return newarr;
}

export function drivingProps(id, prev) {
    return {
        date: new NurDate(prev?.date),
        from: prev?.from || null,
        to: prev?.to || null,
        id: id,
        type: "driving",
        carPower: prev?.carPower || "",
        carModel: prev?.carModel || "",
        price: 0
    };
}

async function computeDistance(data, setDistance) {
    if (!data.from || !data.to) {
        setDistance(0);
        return;
    }
    if (!data.from.id || !data.to.id) {
        setDistance(0);
        return;
    }
    
    setDistance(-1);

    const fromPlace = new google.maps.places.Place({
        id: data.from.id
    });

    const toPlace = new google.maps.places.Place({
        id: data.to.id
    });

    const { routes } = await google.maps.routes.Route.computeRoutes({
        origin: fromPlace,
        destination: toPlace,
        travelMode: google.maps.DirectionsTravelMode.DRIVING,
        computeAlternativeRoutes: true,
        fields: ['distanceMeters']
    });
    const minDistance = Math.min( ...routes.map(r => Math.round( r.distanceMeters / 1000 )) );

    setDistance(minDistance);
}

export const Driving = memo(({ data, setData, remove, errors, carsList }) => {
    const routesLibrary = useMapsLibrary("routes");
    const placesLibrary = useMapsLibrary("places");

    const [distance, setDistance] = useState(0);
    const [pricePerKm, setPricePerKm] = useState(0);

    useEffect(() => {
        if (!routesLibrary || !placesLibrary) return;
        computeDistance(data, (d) => setDistance( d ) );
    }, [data.from, data.to, routesLibrary, placesLibrary]);

    useEffect(() => {
        if( !data.carModel || !data.carPower || !carsList )
            setPricePerKm(0);

        const car = carsList.find(c => c['label'] == data.carModel && c['power'] == data.carPower);
        if( car )
            setPricePerKm(car['priceperkm_estimated']);
        else setPricePerKm(0);
    }, [data.carModel, data.carPower, carsList]);

    useEffect(() => {
        setData({ ...data, price: distance * pricePerKm });
    }, [distance, pricePerKm]);

    const [power,setPower] = useState([])
    useEffect(() => {
        const t = {}
        carsList.forEach((c) => {
            t[c['power']] = 1;
        })
        setPower(Object.keys(t))
    }, [carsList]);

    return <div className="my-2 border-l-4 border-t-4 rounded-xl pl-1 border-primary-main flex flex-col">
        <div className="flex flex-row justify-end">
            <div className="chip-button" onClick={() => remove(data.id)}>
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Elimina
            </div>
        </div>
        <ExpensesErrorDiv errors={errors} />

        <label>Data di inizio del viaggio</label>
        <NurDatePicker value={data.date} onChange={(date) => setData({ ...data, date: date })} />

        <label>Luogo di partenza</label>
        <AutocompleteElement
            place={data.from}
            setPlace={(newPlace) => setData({ ...data, from: newPlace })} />

        <label>Luogo di arrivo</label>
        <AutocompleteElement
            place={data.to}
            setPlace={(newPlace) => setData({ ...data, to: newPlace })} />

        <label>Distanza (stimata)</label>
        { distance >= 0 ?
            <input type="text" className="w-full" value={distance > 0 ? (distance.toFixed(0) + " km") : "-"} readOnly />
            : <FontAwesomeIcon icon={faSpinner} spin /> }

        <label>Tipo di auto</label>
        <SmartSelect
            list={power}
            value={data.carPower}
            setValue={(value) => setData({...data, carPower: value})}
            getLabel={(v) => v}
            getValue={(v) => v} />

        {
            data.carPower && <>
                <label>Modello</label>
                <SmartSelect
                    list={carsList.filter(c => c['power'] == data.carPower)}
                    value={data.carModel}
                    setValue={(value) => setData({...data, carModel: value})}
                    getLabel={(v) => v['label']}
                    getValue={(v) => v['label']} />
            </>
        }
        <label>Rimborso (Stimato)</label>
        { distance >= 0 && pricePerKm > 0 ?
            <input type="text" className="w-full" value={(distance*pricePerKm).toFixed(2) + " €"} readOnly />
            : <FontAwesomeIcon icon={faSpinner} spin /> }
        <label className="unspaced">Prezzo stimato che non tiene ancora conto della variazione giornaliera dei prezzi dei carburanti.</label>


    </div>;
}, (prev, next) => JSON.stringify(prev.data) == JSON.stringify(next.data) && JSON.stringify(prev.errors) == JSON.stringify(next.errors) && prev.carsList.length == next.carsList.length);



function AutocompleteElement({ place, setPlace }) {
    const places = useMapsLibrary("places");

    const handlePlaceChanged = async (ev) => {
        const place = ev.placePrediction.toPlace();
        await place.fetchFields({ fields: ['formattedAddress'] })
        setPlace({
            'id': place.id,
            'name': place.formattedAddress
        });
    };

    return <><gmp-place-autocomplete
        value={place?.name || ''}
        ongmp-select={handlePlaceChanged}
        placeholder={"Seleziona un luogo..."}
        class="w-full max-w-full"
    /></>
}