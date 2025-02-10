import TokenizableInput from "../Libs/react-tokenizable-inputs/TokenizableInput";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import SmartChip, { SmartChipWithTitle } from "./SmartChip";
import { bgAndContrastPastel } from "../Utils";
import TextareaAutosize from 'react-textarea-autosize';

export default class ADetailsType {
    static values = {
        'arrayable': {
            'label': 'Multivalore',
            'paramName': 'Separatori',
            'paramDefault': '-;',
            'editor': (adt, value, updateValue) =>
                <TokenizableInput
                    separatingCharacters={adt.param}
                    tokensList={value}
                    updateTokensList={updateValue} />,
            'chip': (adt) => adt.value.map((entry, j) => <SmartChip
                content={entry}
                key={adt.id + "|" + j}
                style={bgAndContrastPastel(adt.a_details_type_id)} />
            )
        },
        'string': {
            'label': 'Testo',
            'editor': (adt, value, updateValue) =>
                <input
                    type="text"
                    className="w-full"
                    value={value[0]}
                    onChange={e => updateValue([e.target.value])} />,
            'chip': (adt) => <SmartChipWithTitle
                content={adt.value[0]}
                title={adt.a_details_type.name}
                key={adt.id}
                style={bgAndContrastPastel(adt.a_details_type_id)} />
        },
        'longText': {
            'label': 'Nota lunga',
            'editor': (adt, value, updateValue) =>
                <TextareaAutosize
                    className="w-full pretendToBeInput"
                    minRows={3}
                    value={value[0]}
                    onChange={e => updateValue([e.target.value])} />,
            'chip': (adt) => <SmartChipWithTitle
                content={adt.value[0]}
                title={adt.a_details_type.name}
                key={adt.id}
                style={bgAndContrastPastel(adt.a_details_type_id)} />
        },
        'select': {
            'label': 'Scelta multipla a valori fissi',
            'paramName': 'Valori (separati da ;)',
            'paramDefault': 'Valore 1;Valore 2',
            'editor': (adt, value, updateValue) => {
                const options = adt.param?.split(';').map(i => ({ value: i, label: i })) || [];
                return <Select
                    className="w-full"
                    classNames={{ control: () => 'selectDropdown' }}
                    value={{ value: value[0], label: value[0] }}
                    onChange={(sel) => updateValue([sel.value])}
                    options={options} />
            },
            'chip': (adt) => <SmartChipWithTitle
                content={adt.value[0]}
                title={adt.a_details_type.name}
                key={adt.id}
                style={bgAndContrastPastel(adt.a_details_type_id)} />
        },
        'creatableSelect': {
            'label': 'Scelta multipla o nuovo valore',
            'editor': (adt, value, updateValue) => {
                const options = adt.usedValues?.map(i => ({ value: i, label: i })) || [];
                return <CreatableSelect
                    className="w-full"
                    classNames={{ control: () => 'selectDropdown' }}
                    value={{ value: value[0], label: value[0] }}
                    onChange={(sel) => updateValue([sel.value])}
                    options={options} />
            },
            'chip': (adt) => <SmartChipWithTitle
                content={adt.value[0]}
                title={adt.a_details_type.name}
                key={adt.id}
                style={bgAndContrastPastel(adt.a_details_type_id)} />
        }
    }
}