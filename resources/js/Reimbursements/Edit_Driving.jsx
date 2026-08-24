

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

function delFromArray(arr, idx) {
    const newarr = arr.toSpliced(idx, 1)
    return newarr;
}

export function drivingProps(id, prev) {
    return {
        date: new NurDate(prev?.date),
        from: prev?.from || null,
        to: prev?.to || null,
        distance: prev?.distance || 0,
        id: id,
        type: "driving"
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

export const Driving = memo(({ data, setData, remove, errors }) => {
    const routesLibrary = useMapsLibrary("routes");
    const placesLibrary = useMapsLibrary("places");

    useEffect(() => {
        if (!routesLibrary || !placesLibrary) return;
        computeDistance(data, (d) => setData({ ...data, distance: d }));
    }, [data.from, data.to, routesLibrary, placesLibrary]);

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
        { data.distance >= 0 ?
            <input type="text" className="w-full" value={data.distance > 0 ? (data.distance.toFixed(0) + " km") : "-"} readOnly />
            : <FontAwesomeIcon icon={faSpinner} spin /> }
        

    </div>;
}, (prev, next) => JSON.stringify(prev.data) == JSON.stringify(next.data) && JSON.stringify(prev.errors) == JSON.stringify(next.errors));



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