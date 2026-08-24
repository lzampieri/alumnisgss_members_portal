

// todo bisogna limitare le date al progetto!

import { Component, memo, useState } from "react";
import { NurDate, NurDatePicker } from "../Libs/DateEditor";
import { usePage } from "@inertiajs/react";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { noninertiaPostRequest } from "../Utils";
import Backdrop from "../Layout/Backdrop";
import { ExpensesErrorDiv } from "./Edit_ErrorDiv";

function delFromArray(arr, idx) {
    const newarr = arr.toSpliced(idx, 1)
    return newarr;
}

function FileDropArea({ files, setFiles }) {
    const [loading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState("");
    const reimbursementId = usePage().props.reimbursement.id

    const onDrop = acceptedFiles => {
        if (acceptedFiles.length == 0) return;

        noninertiaPostRequest(
            'reimbursements.uploadFiles',
            { files: acceptedFiles },
            setIsLoading,
            { reimbursement: reimbursementId },
            (data) => {
                setFiles([...files, ...data]);
            },
            true,
            (data) => {
                if (data?.errors) {
                    setErrors(Object.values(data?.errors).flat().join("\n"));
                }
            }
        )
    }

    const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: true })

    return <>
        <div {...getRootProps()} className="border-2 border-dashed rounded-md flex flex-col items-center py-2">
            <input {...getInputProps()} />
            <FontAwesomeIcon icon={faFileArrowUp} className="text-xl" />
            <div className="text-center text-sm">Trascina qui la ricevuta da caricare, o clicca per selezionarla dal pc.</div>
            <div className="text-xs text-center">Formati accettati: {usePage().props.allowedFormats.join(", ")}</div>
            <label className="error whitespace-pre-wrap">{errors}</label>
        </div>
        {
            files?.map((f, idx) =>
                <div className="w-full flex flex-row items-center" key={f.id}>
                    <div className="button mr-2" onClick={() => setFiles(delFromArray(files, idx))}><FontAwesomeIcon icon={faTrashCan} /></div>
                    <a target="_blank" className="overflow-hidden text-ellipsis" href={route('reimbursements.viewFile', { id: f.id })}>{f.handle}</a>
                </div>
            )
        }
        <Backdrop open={loading} />
    </>
}

export function materialProps(id, prev) {
    return {
        title: prev?.title || "",
        place: prev?.place || "",
        date: new NurDate(prev?.date),
        price: prev?.price || 0.00,
        files: prev?.files || [],
        id: id,
        type: "material"
    };
}

export const Material = memo(({data, setData, remove, errors}) => {
    return <div className="my-2 border-l-4 border-t-4 rounded-xl pl-1 border-primary-main">
        <div className="flex flex-row justify-end">
            <div className="chip-button" onClick={() => remove(data.id)}>
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Elimina
            </div>
        </div>
        <ExpensesErrorDiv errors={errors} />
        <label>Materiale acquistato</label>
        <input className="w-full" type="text" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="Cavatappi, calcestruzzo, melanzane..." />

        <label>Acquistato presso</label>
        <input className="w-full" type="text" value={data.place} onChange={(e) => setData({ ...data, place: e.target.value })} />

        <label>Data d'acquisto</label>
        <NurDatePicker value={data.date} onChange={(date) => setData({ ...data, date: date })} />

        <label>Prezzo [€]</label>
        <input className="w-full" type="number" min="0" step="0.01" value={data.price.toString()} onChange={(e) => setData({ ...data, price: Math.round(e.target.value * 100) / 100 })} />

        <label>Ricevuta e/o altri giustificativi</label>
        <FileDropArea files={data.files} setFiles={(f) => setData({ ...data, files: f })} />
    </div>;
}, (prev, next) => JSON.stringify(prev.data) == JSON.stringify(next.data) && JSON.stringify(prev.errors) == JSON.stringify(next.errors));

export function travelProps(id, prev) {
    return {
        way: prev?.way || "",
        from: prev?.from || "",
        to: prev?.to || "",
        date: new NurDate(prev?.date),
        price: prev?.price || 0.00,
        files: prev?.files || [],
        id: id,
        type: "travel"
    };
}

export const Travel = memo(({data, setData, remove, errors}) => {
    return <div className="my-2 border-l-4 border-t-4 rounded-xl pl-1 border-primary-main">
        <div className="flex flex-row justify-end">
            <div className="chip-button" onClick={() => remove(data.id)}>
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Elimina
            </div>
        </div>
        <ExpensesErrorDiv errors={errors} />
        <label>Mezzo di trasporto</label>
        <input className="w-full" type="text" value={data.way} onChange={(e) => setData({ ...data, way: e.target.value })}
            placeholder="Mongolfiera, monopattino, cammello..." />

        <label>Partenza da</label>
        <input className="w-full" type="text" value={data.from} onChange={(e) => setData({ ...data, from: e.target.value })} />

        <label>Arrivo a</label>
        <input className="w-full" type="text" value={data.to} onChange={(e) => setData({ ...data, to: e.target.value })} />

        <label>Data di inizio del viaggio</label>
        <NurDatePicker value={data.date} onChange={(date) => setData({ ...data, date: date })} />

        <label>Prezzo [€]</label>
        <input className="w-full" type="number" min="0" step="0.01" value={data.price.toString()} onChange={(e) => setData({ ...data, price: Math.round(e.target.value * 100) / 100 })} />

        <label>Ricevuta e/o altri giustificativi</label>
        <FileDropArea files={data.files} setFiles={(f) => setData({ ...data, files: f })} />
    </div>;
}, (prev, next) => JSON.stringify(prev.data) == JSON.stringify(next.data) && JSON.stringify(prev.errors) == JSON.stringify(next.errors));
