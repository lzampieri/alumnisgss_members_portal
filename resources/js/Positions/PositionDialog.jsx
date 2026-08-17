import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import EmptyDialog from "../Layout/EmptyDialog";

import CreatableSelect from 'react-select/creatable';
import Select, { createFilter } from 'react-select';
import { AlumnusStatus, romanize } from "../Utils";


import Backdrop from "../Layout/Backdrop";
import { NurDate, NurDatePicker } from "../Libs/DateEditor";

export default function PositionDialog({ toEdit, setToEdit }) {
    const { data, setData, errors, post, transform, processing, setDefaults } = useForm({
        from: new NurDate(),
        to: new NurDate(),
        type: "",
        note: "",
        owner: null
    });
    const [creating, setCreating] = useState(false);

    const submit = (e) => {
        e.preventDefault()
        let rt = toEdit ? route('positions.edit', { position: toEdit.id }) : route('positions.create')
        post(rt, { onSuccess: () => { setCreating(false); setToEdit(null) } });
    }

    const positions = usePage().props.positions
    const typeOptions = useMemo(() => positions.map((p) => p.type).filter((value, index, array) => array.indexOf(value) === index).map(t => ({ value: t, label: t})), [positions]);

    const positionable = usePage().props.positionable
    const idOptions = useMemo(() => 
        positionable.map((p) => { return { id: p.id, label: <span>{p.surname} {p.name} <span className="text-gray-400">({romanize(p.coorte)}) - {p.coorte > 0 ? AlumnusStatus.status[p.status].label : p.notes}</span></span>, filter: p.surname + " " + p.name + " " + p.coorte + " " + " " + p.notes } }) || [],
        [positionable]);

    transform((data) => ({
        ...data,
        owner: idOptions[data.owner.value]?.id
    }));

    useEffect(() => {
        if (creating) {
            setData({
                'from': new NurDate(),
                'to': new NurDate(),
                'type': "",
                'note': "",
                'owner': null,
            })
        }
    }, [creating])
    useEffect(() => {
        if (toEdit) {
            setData({
                'from': new NurDate(toEdit.from),
                'to': new NurDate(toEdit.to),
                'type': toEdit.type,
                'note': toEdit.note || "",
                'owner': { value: idOptions.findIndex(o => o.id == toEdit.owner_id) },
            })
        }
    }, [toEdit])

    return <>
        <div className="button" onClick={() => setCreating(true)}>
            <FontAwesomeIcon icon={faAdd} className="mr-2" />
            Aggiungi
        </div>
        <EmptyDialog open={creating || toEdit} onClose={() => { setCreating(false); setToEdit(null) }}>
            <form onSubmit={submit} className="w-full flex flex-col items-stretch mt-4 text-black">
                <label>Identità</label>
                <Select
                    classNames={{ control: () => 'selectDropdown' }}
                    isSearchable={true}
                    getOptionLabel={(option) => idOptions[option.value]?.label || ""}
                    filterOption={createFilter({ stringify: option => idOptions[option.value]?.filter || "" })}
                    options={[...idOptions.keys().map(k => ({ value: k }))]}
                    value={data.owner}
                    onChange={(sels) => setData('owner', sels)} />
                <label className="error">{errors.owner}</label>

                <label>Tipo</label>
                <CreatableSelect
                    className="w-full"
                    classNames={{ control: () => 'selectDropdown' }}
                    value={{ value: data.type, label: data.type }}
                    onChange={(sel) => setData('type', sel.value)}
                    options={typeOptions} />
                <label className="error">{errors.type}</label>

                <label>Note</label>
                <input type="text" className="w-full" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                <label className="error">{errors.note}</label>

                <label>Nomina</label>
                <NurDatePicker
                    value={data.from}
                    classNames='w-full'
                    onChange={(date) => setData('from', date)} />
                <label className="error">{errors.from}</label>

                <label>Scadenza</label>
                <NurDatePicker
                    value={data.to}
                    classNames='w-full'
                    onChange={(date) => setData('to', date)} />
                <label className="error">{errors.to}</label>

                <input type="submit" className="button" value="Salva incarico" />

                <Backdrop open={processing} />
            </form>
        </EmptyDialog>
    </>
}