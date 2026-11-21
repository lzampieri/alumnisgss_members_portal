
import { faFont } from "@fortawesome/free-solid-svg-icons";
import TokenizableInput from "../../Libs/react-tokenizable-inputs/TokenizableInput";
import SmartSelect from "../../Libs/SmartSelect";
import { usePage } from "@inertiajs/react";
import Editor from "../../Libs/Editor";

export default class LargeSelectQuestion {
    static title = "Scelta multipla"
    static icon = faFont
    static isForm = true

    static getDefaultData() {
        return {
            title: '',
            subtitle: '',
            options: [],
            map: true
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {

        const setFieldValue = (field, value, idx) => {
            let options = [...item.options]
            options[idx][field] = value
            setItemValue('options', options)
        }

        const addOption = () =>
            setItemValue('options', [
                ...item.options,
                { label: '', text: '' }
            ])

        const removeOption = (i) =>
            setItemValue('options', item.options.toSpliced(i, 1))


        return <div
            className="w-full"
            onPointerDown={(e) => e.stopPropagation()}>
            <input value={item.title} onChange={(e) => setItemValue('title', e.target.value)} className="w-full text-xl font-bold" placeholder="Domanda..." />
            <input value={item.subtitle} onChange={(e) => setItemValue('subtitle', e.target.value)} className="w-full" placeholder="Altri dettagli..." />
            {item.options.map((o, i) => <div className="flex flex-col my-3" key={i}>
                <b>Opzione {i + 1}</b>
                <a href="#" onClick={() => removeOption(i)}>Elimina opzione</a>
                <label className="unspaced">Valore: (visualizzato nelle risposte e nell'excel)</label>
                <input type="text" value={o.label} onChange={(e) => setFieldValue('label', e.target.value, i)} />
                <Editor
                    value={o.text}
                    setValue={(v) => setFieldValue('text', v, i)}
                    url_for_uploading={route('resources.upload_img_editor', { resource: usePage().props.resource?.id })}
                    route_for_retriving={'resources.retrive_img_editor'} />
            </div>)}
            <div className="button self-center" onClick={addOption}>Aggiungi opzione</div>
        </div>
    }

    static mainElementReadOnly = ({ item, formValue, setFormValue }) => {
        return <div
            className="w-full">
            <div className="text-xl font-bold">{item.title}</div>
            <div>{item.subtitle}</div>
            {
                item.options.map((o, i) =>
                    <div className="w-full border rounded bg-pink-100 aria-checked:bg-pink-500 hover:bg-pink-300 p-2" aria-checked={o.label==formValue} onClick={() => setFormValue(o.label)} key={i}>
                        <label className="unspaced">{o.label}</label>
                        <div className="w-full" dangerouslySetInnerHTML={{__html: o.text}} />
                    </div>
                )
            }
        </div>
    }
}