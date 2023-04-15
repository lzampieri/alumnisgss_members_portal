import { useForm, usePage } from "@inertiajs/react";
import { AlumnusStatus, romanize } from "../Utils";
import Select, { createFilter } from 'react-select';
import { countBy, keys } from "lodash";

export default function BulkState() {
    const alumni = usePage().props.alumni
    const options = usePage().props.availableStatus.map(i => { return { value: i, label: AlumnusStatus.status[i].label } })

    const { data, setData, post, transform, processing, errors } = useForm({
        alumni: [],
        new_state: null
    })

    transform((data) => {
        return {
            alumni_id: data.alumni.map(a => a.id),
            new_state: data.new_state.value
        }
    })

    const submit = (e) => {
        e.preventDefault();
        post(route('registry.bulk.edit'));
    }

    let counts = countBy(data.alumni.map(a => a.status))

    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <h3>Cambiamento rapido di stato</h3>
            <label>Alumni interessati</label>
            <Select
                isMulti={true}
                isSearchable={true}
                getOptionValue={(option) => option.id}
                getOptionLabel={(option) => <span>{option.surname} {option.name} <span className="text-gray-400">({romanize(option.coorte)})</span></span>}
                filterOption={createFilter({ stringify: option => option.data.surname + " " + option.data.name + " " + option.data.coorte + " " + romanize(option.data.coorte) })}
                options={alumni}
                value={data.alumni}
                onChange={(sels) => setData('alumni', sels)} />
            <label className="error">{errors.alumnus}{errors.alumnus_id}</label>
            {data.alumni.length > 0 && <>
                <label>Stati correnti:</label>
                <ul className="font-bold">
                    {keys(counts).map(k =>
                        <li>{AlumnusStatus.status[k].label} ({counts[k]})</li>
                    )}
                </ul>
            </>}
            <label>Stato richiesto:</label>
            <Select
                options={options}
                value={data.new_state}
                onChange={(sel) => setData('new_state', sel)} />
            <label className="error">{errors.new_state}</label>
            <input type="button" className="button mt-4" onClick={submit} value="Salva" />
        </form>
    );
}