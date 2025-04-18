import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useForm, usePage } from "@inertiajs/react";
import React from "react";
import TextareaAutosize from 'react-textarea-autosize';
import Backdrop from "../Layout/Backdrop";

function GenerateInput({type, value, setValue}) {
    if (type == 'shortText') return <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
    if (type == 'longText') return <TextareaAutosize className="w-full pretendToBeInput" minRows={10} value={value} onChange={e => setValue(e.target.value)}/>
}

export default function Add() {
    const fieldList = usePage().props.fieldList;
    const type = usePage().props.type;

    const { data, setData, processing, errors, post } = useForm( Object.fromEntries( Object.keys(fieldList).map( k => [k, '']) ) )

    const submit = (e) => {
        e.preventDefault();
        post(route('ticket.add', {type: type}));
    }

    return <div className="main-container">
        <Link className="button self-start" href={route('ticket.addList')}>
            <FontAwesomeIcon icon={solid('circle-left')} className="pr-2" />
            Indietro
        </Link>
        <h3 className="my-3">Aggiungi richiesta - {usePage().props.name}</h3>

        <div className="w-full flex flex-col items-stretch">
            <label>Autore</label>
            <input type="text" disabled value={usePage().props.author} />

            {Object.keys(fieldList).map((key) => <React.Fragment key={key}>
                <label key={'lab_' + key}>{fieldList[key].label}</label>
                <GenerateInput key={key} type={fieldList[key].type} value={data[key]} setValue={(value) => setData(key, value)} />
                <label className="error">{errors[key]}</label>
            </React.Fragment>)}

            <button className="button self-center mt-3" onClick={submit} disabled={processing}>
                <FontAwesomeIcon icon={solid('paper-plane')} className="pr-2" />
                Invia
            </button>

            {/* {availableTypes.map((type) =>
            <Link key={type.key} className="w-full flex flex-row-reverse items-center bg-gray-50 border-gray-400 border py-2 px-4 rounded-first-last group no-underline" href={route('ticket.add', { type: type.key })}>
                <FontAwesomeIcon icon={solid('right-long')} className="text-4xl !p-4 icon-button" />
                <span className="grow">{type.name}</span>
            </Link>
        )} */}
        </div>
        <Backdrop open={processing} />
    </div>
}