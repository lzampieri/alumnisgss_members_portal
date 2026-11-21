
import { faFont } from "@fortawesome/free-solid-svg-icons";
import TokenizableInput from "../../Libs/react-tokenizable-inputs/TokenizableInput";
import SmartSelect from "../../Libs/SmartSelect";

export default class SelectQuestion {
    static title = "Scelta a tendina"
    static icon = faFont
    static isForm = true

    static getDefaultData() {
        return {
            title: '',
            subtitle: '',
            options: []
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {


        return <div
            className="w-full"
            onPointerDown={(e) => e.stopPropagation()}>
            <input value={item.title} onChange={(e) => setItemValue('title', e.target.value)} className="w-full text-xl font-bold" placeholder="Domanda..." />
            <input value={item.subtitle} onChange={(e) => setItemValue('subtitle', e.target.value)} className="w-full" placeholder="Altri dettagli..." />
            <TokenizableInput
                separatingCharacters={""}
                tokensList={item.options}
                updateTokensList={(newList) => setItemValue('options', newList)} />
        </div>
    }

    static mainElementReadOnly = ({ item, formValue, setFormValue }) => {
        return <div
            className="w-full">
            <div className="text-xl font-bold">{item.title}</div>
            <div>{item.subtitle}</div>
            <SmartSelect
                list={item.options}
                value={formValue}
                setValue={(value) => setFormValue(value)}
                getLabel={(v) => v}
                getValue={(v) => v} />
        </div>
    }
}