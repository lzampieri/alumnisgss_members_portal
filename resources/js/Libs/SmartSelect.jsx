import { useMemo } from 'react';
import Select from 'react-select';

export default function SmartSelect({ value, setValue, list, getLabel, getValue }) {
    const options = useMemo(() => list.map(i => ({ value: getValue(i), label: getLabel(i) })), [list]);
    return <Select
            classNames={{ control: () => 'selectDropdown' }}
            className="w-full my-1"
            value={options.find(i => i.value == value)}
            onChange={(sel) => setValue(sel.value)}
            options={options}
        />
}