import TokenizableInput from "../Libs/react-tokenizable-inputs/TokenizableInput";


export default class ADetailsType {
    static values = {
        'arrayable': {
            'label': 'Multivalore',
            'paramName': 'Separatori',
            'paramDefault': '-;',
            'editor': ( adt, value, updateValue ) =>
                <TokenizableInput
                    separatingCharacters={adt.param}
                    tokensList={value}
                    updateTokensList={updateValue} />
        },
        'string': {
            'label': 'Testo',
            'editor': ( adt, value, updateValue ) =>
                <input
                    type="text"
                    className="w-full"
                    value={value[0]}
                    onChange={e => updateValue([e.target.value])} />
        }
    }
}