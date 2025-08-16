import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import Select from 'react-select';


export default function ParentSelector({ value, setValue }) {

    const possibleParents = usePage().props.possibleParents;
    const typesOptions = useMemo(() => [{ value: undefined, label: '-' }].concat(
        possibleParents.map( p => ({
            value: p.id,
            label: '-'.repeat(p.depth) + '>' + p.title
        }))
    ), [possibleParents]);

    return <Select
        className="w-full my-1"
        value={typesOptions.find(i => i.value == value)}
        onChange={(sel) => setValue(sel.value)}
        options={typesOptions}
    />
}