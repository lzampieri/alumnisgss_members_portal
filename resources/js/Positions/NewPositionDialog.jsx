import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import EmptyDialog from "../Layout/EmptyDialog";

import DatePicker from "tailwind-datepicker-react";
import CreatableSelect from 'react-select/creatable';
import Select, { createFilter } from 'react-select';
import { AlumnusStatus, romanize } from "../Utils";


import Backdrop from "../Layout/Backdrop";



export default function NewPositionDialog({ toEdit, setToEdit }) {
    const { data, setData, errors, post, transform, processing, setDefaults } = useForm({
        from: new Date(),
        to: new Date(),
        type: "",
        note: "",
        owner: undefined
    });
    const [creating, setCreating] = useState(false);

    const [datePicker1Open, setDatePicker1Open] = useState(false);
    const [datePicker2Open, setDatePicker2Open] = useState(false);

    const submit = (e) => {
        e.preventDefault()
        let rt = toEdit ? route('positions.edit', { position: toEdit.id }) : route('positions.create')
        post(rt, { onSuccess: () => { setCreating(false); setToEdit(null) } });
        
    }

    const positions = usePage().props.positions
    const typeOptions = useMemo(() => positions.map((p) => p.type).filter((value, index, array) => array.indexOf(value) === index).map(t => ({ value: t, label: t})), [positions]);

    const positionable = usePage().props.positionable
    const idOptions = useMemo(() => [
        ...(positionable['App\\Models\\Alumnus']?.map((p) => { return { type: 'App\\Models\\Alumnus', id: p.id, label: <span>{p.surname} {p.name} <span className="text-gray-400">({romanize(p.coorte)}) - {AlumnusStatus.status[p.status].label}</span></span>, filter: p.surname + " " + p.name + " " + p.coorte } }) || []),
        ...(positionable['App\\Models\\External']?.map((p) => { return { type: 'App\\Models\\External', id: p.id, label: <span>{p.surname} {p.name} <span className="text-gray-400 small">({p.notes})</span></span>, filter: p.surname + " " + p.name + " " + p.notes } }) || []),
    ], [positionable]);

    transform((data) => ({
        ...data,
        owner_type: idOptions[data.owner.value]?.type,
        owner_id: idOptions[data.owner.value]?.id
    }));

    useEffect(() => {
        if (creating) {
            setData('from', new Date())
            setData('to', new Date())
            setData('type', "")
            setData('note', "")
            setData('owner', undefined)
        }
    }, [creating])
    useEffect(() => {
        if (toEdit) {
            setData('from', new Date(toEdit.from))
            setData('to', new Date(toEdit.to))
            setData('type', toEdit.type)
            setData('note', toEdit.note || "")
            setData('owner', { value: idOptions.findIndex(o => o.id == toEdit.owner_id && o.type == toEdit.owner_type) })
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
                <label className="error">{errors.owner_type}</label>
                <label className="error">{errors.owner_id}</label>

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
                <DatePicker
                    value={data.from}
                    classNames='w-full' options={{ defaultDate: data.from, language: 'it', theme: { input: '!text-black' } }}
                    onChange={(date) => setData('from', date)} show={datePicker1Open} setShow={setDatePicker1Open} />
                <label className="error">{errors.from}</label>

                <label>Scadenza</label>
                <DatePicker
                    value={data.to}
                    classNames='w-full' options={{ defaultDate: data.to, language: 'it', theme: { input: '!text-black' } }}
                    onChange={(date) => setData('to', date)} show={datePicker2Open} setShow={setDatePicker2Open} />
                <label className="error">{errors.to}</label>

                <input type="hidden" value={data.owner_id} />
                <input type="hidden" value={data.owner_type} />

                <input type="submit" className="button" value="Salva incarico" />

                <Backdrop open={processing} />
            </form>
        </EmptyDialog>
    </>
}