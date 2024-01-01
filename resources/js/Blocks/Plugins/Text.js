import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useState } from "react";


export default class Text {
    static title = "Testo"
    static icon = solid('font')

    static getDefaultData() {
        return {
            content: ''
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        const [lines,setLines] = useState( 5 );
        const onChange = (e) => {
            setItemValue('content',e.target.value)
            setLines(e.target.value.split(/\r\n|\r|\n/).length + 5);
        }

        return <textarea
            className="textarea-container w-full"
            rows={lines} 
            value={item.content}
            onChange={ onChange }
            placeholder="Testo"
        />
    }

    static mainElementReadOnly = ({ item }) => {
        return <p className="whitespace-pre-wrap">
            { item.content }
        </p>
    }
}