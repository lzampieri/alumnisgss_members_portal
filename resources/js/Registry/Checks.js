import { Link, useForm, usePage } from "@inertiajs/react";
import ADetailsType from "../Network/ADetailsType";
import { useMemo, useState } from "react";
import Select from 'react-select';
import Backdrop from "../Layout/Backdrop";
import { postRequest } from "../Utils";

function textExpVal(code, val) {
    const singleVal = code.match(/^(\d+)$/);
    if (singleVal) {
        return val == parseInt(singleVal);
    }
    const between = code.match(/^(\d+):(\d+)$/);
    if (between) {
        return (val >= parseInt(between[1])) && (val <= parseInt(between[2]));
    }
    const morethan = code.match(/^(\d+):$/);
    if (morethan) {
        return (val >= parseInt(morethan[1]));
    }
    const lessthan = code.match(/^:(\d+)$/);
    if (lessthan) {
        return (val <= parseInt(lessthan[1]));
    }
    return true;
}

function verifyCounts() {
    const adtprelist = usePage().props.adtlist;
    const adtlist = useMemo(() => {
        Object.keys(adtprelist).forEach(k => {
            adtprelist[k]['expval'] = (
                adtprelist[k]['type'] in ADetailsType.values ? ADetailsType.values[adtprelist[k]['type']]['expval'] : 0);
        });
        return adtprelist;
    }, [adtprelist]);

    const alumnusData = usePage().props.alumnusData;
    const errorsInAlumnusData = useMemo(() => {
        const list = [];
        alumnusData.forEach(alumnus => {
            Object.keys(adtlist).forEach(k => {
                if (!textExpVal(adtlist[k]['expval'], k in alumnus['a_details_keyd'] ? alumnus['a_details_keyd'][k] : 0)) {
                    list.push({
                        ...alumnus,
                        'det_id': k,
                        'val': k in alumnus['a_details_keyd'] ? alumnus['a_details_keyd'][k] : 0
                    })
                }
            });
        })
        return list;
    }, [adtlist, alumnusData])

    return <>
        <h4>Verifica dettagli</h4>
        <h5>Valori attesi:</h5>
        <ul className="list-disc list-inside">
            {Object.values(adtlist).map(adt => <li key={adt.id}>{adt.name}: {adt.expval}</li>)}
        </ul>
        <h5>Valori errati:</h5>
        <ul className="list-disc list-inside">
            {errorsInAlumnusData.map((err, i) =>
                <li key={i}><a href={route('registry.edit', { id: err.id })}>{err.name} {err.surname}</a> - {adtlist[err.det_id].name}: {err.val} instead of {adtlist[err.det_id].expval}</li>)}
            {errorsInAlumnusData.length == 0 && <>Nessun valore errato rilevato! Evviva!</>}
        </ul>
    </>
}

function OldDetailsRow({ k, values }) {
    const { data, setData, post, processing } = useForm({
        from: k,
        to: null
    })
    const adtlist = usePage().props.adtlist;

    const options = Object.keys(adtlist).map(k => ({ value: k, label: adtlist[k].name }));

    return <li className="pb-4">
        {k}<br />
        <label className="unspaced">Con valori: {values.join(', ')}</label><br />
        <Select
            classNames={{ control: () => 'selectDropdown' }}
            value={options.find(i => options.value == data.to)}
            options={options}
            onChange={(sel) => setData('to', sel.value)} />
        <div className="discrete-button" onClick={() => post(route('registry.checks.assdet'))}>Associa</div>
        <Backdrop open={processing} />
    </li>

}

function oldDetails() {
    const list = usePage().props.oldDetails
    return <>
        <h4>Verifica vecchi dettagli</h4>
        <ul>
            {Object.keys(list).length == 0 && <>Nessun dettaglio nel vecchio formato rilevato! Evviva!</>}
            {Object.keys(list).map(k => <OldDetailsRow key={k} k={k} values={list[k]} />)}
        </ul>
    </>
}

function doubledDetails() {
    const list = usePage().props.doubledDetails;
    const { data, setData, post, processing } = useForm({
        selected: []
    })

    const toggle = (id) => {
        if (data.selected.includes(id)) {
            data.selected.splice(data.selected.indexOf(id), 1)
            setData('selected', data.selected.slice())
        } else
            setData('selected', data.selected.concat([id]))
    }

    return <>
        <h4>Valori duplicati nei dettagli</h4>
        <ul className="list-disc list-inside">
            <div className="discrete-button" onClick={() => post(route('registry.checks.dupcor'))}>Correggi selezionati</div>
            <div className="discrete-button" onClick={() => setData('selected', list.map(i => i.id))}>Seleziona tutti</div>
            {list.length == 0 && <>Nessun dettaglio duplicato rilevato! Evviva!</>}
            {list.map((k, i) => <li key={i}>
                <input type="checkbox" checked={data.selected.includes(k.id)} onChange={() => toggle(k.id)} />
                {k.a_details_type.name} for <Link href={route('registry.edit', { id: k.identity.id })}>{k.identity.name} {k.identity.surname}</Link>: {JSON.stringify(k.value)}
            </li>)}
            <Backdrop open={processing} />
        </ul>
    </>
}

function wrongSelect() {
    const list = usePage().props.wrongSelect;

    return <>
        <h4>Valori irregolari nei dettagli a scelta multipla</h4>
        <ul className="list-disc list-inside">
            {list.length == 0 && <>Nessun valore irregolare rilevato! Evviva!</>}
            {list.map((k, i) => <li key={i}>
                {k.a_details_type.name} for <Link href={route('registry.edit', { id: k.identity.id })}>{k.identity.name} {k.identity.surname}</Link>: "{k.value}" non è in {k.a_details_type.param}
            </li>)}
        </ul>
    </>
}

export default function Checks() {

    return <>
        <h3>Controlli integrità anagrafica</h3>
        <div className="w-full flex-col">
            {oldDetails()}
            <hr className="my-2" />
            {wrongSelect()}
            <hr className="my-2" />
            {doubledDetails()}
            <hr className="my-2" />
            {verifyCounts()}
        </div>
    </>
}