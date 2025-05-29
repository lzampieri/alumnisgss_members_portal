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
            'expval': '0:',
            'editor': (ad, value, updateValue) =>
                <TokenizableInput
                    separatingCharacters={ad.param}
                    tokensList={value}
                    updateTokensList={updateValue} />,
            'chip': (ad) => ad.value.map((entry, j) => <SmartChip
                content={entry}
                key={ad.id + "|" + j}
                style={bgAndContrastPastel(ad.a_details_type_id)} />
            )
        },
        'string': {
            'label': 'Testo',
            'expval': '0:1',
            'editor': (ad, value, updateValue) =>
                <input
                    type="text"
                    className="w-full"
                    value={value[0]}
                    onChange={e => updateValue([e.target.value])} />,
            'chip': (ad,adt) => <SmartChipWithTitle
                content={ad.value[0]}
                title={adt.name}
                key={ad.id}
                style={bgAndContrastPastel(adt.id)} />
        },
        'longText': {
            'label': 'Nota lunga',
            'expval': '0:1',
            'editor': (ad, value, updateValue) =>
                <TextareaAutosize
                    className="w-full pretendToBeInput"
                    minRows={3}
                    value={value[0]}
                    onChange={e => updateValue([e.target.value])} />,
            'chip': (ad,adt) => <SmartChipWithTitle
                content={ad.value[0]}
                title={adt.name}
                key={ad.id}
                style={bgAndContrastPastel(adt.id)} />
        },
        'select': {
            'label': 'Scelta multipla a valori fissi',
            'paramName': 'Valori (separati da ;)',
            'paramDefault': 'Valore 1;Valore 2',
            'expval': '1',
            'editor': (ad, value, updateValue) => {
                const options = ad.param?.split(';').map(i => ({ value: i, label: i })) || [];
                return <Select
                    className="w-full"
                    classNames={{ control: () => 'selectDropdown' }}
                    value={{ value: value[0], label: value[0] }}
                    onChange={(sel) => updateValue([sel.value])}
                    options={options} />
            },
            'chip': (ad,adt) => <SmartChipWithTitle
                content={ad.value[0]}
                title={adt.name}
                key={ad.id}
                style={bgAndContrastPastel(adt.id)} />
        },
        'creatableSelect': {
            'label': 'Scelta multipla o nuovo valore',
            'expval': '1',
            'editor': (ad, value, updateValue) => {
                const options = ad.usedValues?.map(i => ({ value: i, label: i })) || [];
                return <CreatableSelect
                    className="w-full"
                    classNames={{ control: () => 'selectDropdown' }}
                    value={{ value: value[0], label: value[0] }}
                    onChange={(sel) => updateValue([sel.value])}
                    options={options} />
            },
            'chip': (ad,adt) => <SmartChipWithTitle
                content={ad.value[0]}
                title={adt.name}
                key={ad.id}
                style={bgAndContrastPastel(adt.id)} />
        }
    }
}