import { memo } from "react";
import SmartSelect from "../Libs/SmartSelect";
import { usePage } from "@inertiajs/react";
import TextareaAutosize from 'react-textarea-autosize';


export const EditFirstPart = memo(({ data, setData, errors }) => {
    return <>
        <label>Progetto</label>
        <SmartSelect
            value={data.project_id}
            setValue={(newId) => setData('project_id', newId)}
            list={usePage().props.projects}
            getLabel={(p) => p.title}
            getValue={(p) => p.id}
        />
        <label className="error">{errors.project_id}</label>

        <label>Incarico svolto</label>
        <TextareaAutosize
            className="w-full pretendToBeInput"
            minRows={3}
            value={data.motivation}
            placeholder="Specifica qui l'incarico svolto, indicando e.g. il titolo del corso tenuto, il luogo di attività, il ruolo, etc."
            onChange={(e) => setData('motivation', e.target.value)} />
        <label className="error">{errors.motivation}</label>

        <div className="w-full rounded bg-amber-100 mt-4 p-2 flex flex-col">
            Dati personali<br/>
            <i className="text-xs">Questi dati sono riferiti al profilo utente, e sono trasversali per tutti i rimborsi.</i><br/>

            <label className="unspaced">IBAN</label>
            <input type="text" className="w-full" value={data.IBAN} onChange={(e) => setData('IBAN', e.target.value)} />
            <label className="error">{errors.IBAN}</label>

            <label className="unspaced">Titolare</label>
            <input type="text" className="w-full" value={data.holder} onChange={(e) => setData('holder', e.target.value)} />
            <label className="error">{errors.holder}</label>

            <label className="unspaced">Banca</label>
            <input type="text" className="w-full" value={data.bank} onChange={(e) => setData('bank', e.target.value)} />
            <label className="error">{errors.bank}</label>
        </div>
    </>
}, (prev, next) => JSON.stringify(prev.data) == JSON.stringify(next.data) && JSON.stringify(prev.errors) == JSON.stringify(next.errors));