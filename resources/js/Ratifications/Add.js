import { useForm, usePage } from "@inertiajs/react";
import { AlumnusStatus, romanize } from "../Utils";
import Select, { createFilter } from 'react-select';
import { countBy, keys } from "lodash";
import ReactSwitch from "react-switch";

export default function Add() {
    const alumni = usePage().props.alumni
    const possibleStatus = usePage().props.possibleStatus.map((s) => ({ value: s, label: AlumnusStatus.status[s].label }))

    const { data, setData, post, transform, processing, errors } = useForm({
        alumni: (usePage().props.alumnus ? [usePage().props.alumnus] : []),
        required_state: null,
        rat_force: false
    })

    console.log(errors);

    transform((data) => {
        return {
            alumni_id: data.alumni.map(a => a.id),
            required_state: data.required_state.value,
            rat_force: data.rat_force
        }
    })

    const submit = (e) => {
        e.preventDefault();
        post(route('ratifications.add'));
    }

    let counts = countBy(data.alumni.map(a => a.status))

    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <h3>Variazioni di stato</h3>
            <label>Alumni interessato</label>
            <Select
                isMulti={true}
                classNames={{ control: () => 'selectDropdown' }}
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
                <label>Stato richiesto:</label>
                <Select
                    classNames={{ control: () => 'selectDropdown' }}
                    options={possibleStatus}
                    value={data.required_state}
                    onChange={(sel) => setData('required_state', sel)} />
                <label className="error">{errors.required_state}</label>
                <div className="pt-4 flex flex-row w-full gap-2">
                    <ReactSwitch checked={data.rat_force} onChange={(checked) => setData('rat_force', checked)} /> Forza ratifiche
                </div>
                <label className="unspaced">{data.rat_force ? "Verranno inserite richieste di ratifica per tutti i cambiamenti di stato" : "Verranno inserite richieste di ratifica solo laddove necessario"}</label>
            </>}
            {data.alumni && data.required_state &&
                <input type="button" className="button mt-4" onClick={submit} value="Inserisci richiesta" />
            }
        </form>
    );
}