
import { faFont } from "@fortawesome/free-solid-svg-icons";
import TextareaAutosize from 'react-textarea-autosize';
import ReactSwitch from "react-switch";

export default class OpenQuestion {
    static title = "Domanda aperta"
    static icon = faFont
    static isForm = true

    static getDefaultData() {
        return {
            large: false,
            title: '',
            subtitle: '',
            placeholder: ''
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {


        return <div
            className="w-full"
            onPointerDown={(e) => e.stopPropagation()}>
            <input value={item.title} onChange={(e) => setItemValue('title', e.target.value)} className="w-full text-xl font-bold" placeholder="Domanda..." />
            <input value={item.subtitle} onChange={(e) => setItemValue('subtitle', e.target.value)} className="w-full" placeholder="Altri dettagli..." />
            <div className="flex flex-row">
                <ReactSwitch
                    height={14} width={28} className="m-2"
                    checked={item.large} onChange={(newState) => setItemValue('large', newState)}
                />
                <p>Lascia tanto spazio per il testo</p>
            </div>
        </div>
    }

    static mainElementReadOnly = ({ item, formValue, setFormValue }) => {
        return <div
            className="w-full">
            <div className="text-xl font-bold">{item.title}</div>
            <div>{item.subtitle}</div>
            {item.large ?
                <TextareaAutosize
                    className="w-full pretendToBeInput mt-4"
                    minRows={3}
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)} />
                : <input type="text" value={formValue} onChange={(e) => setFormValue(e.target.value)} className="w-full" />
            }
        </div>
    }
}