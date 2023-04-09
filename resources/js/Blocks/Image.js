import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import AbstrackBlock from "./BlockEnvironment";
import { useState } from "react";


export default class Image extends AbstrackBlock {
    static title = "Image"
    static icon = solid('image')

    getDefaultData() {
        return {
            'content': 'Contenuto'
        }
    }

    mainElementEditable = (props) => {
        const [content, setContent] = useState(this.data.content)
        const updateContent = (e) => {
            setContent(e.target.value)
            this.updateData({ 'content': e.target.value })
        }

        return <input
            type="text"
            value={content}
            onChange={updateContent}
        />
    }

    getMainElementReadOnly() {
        return <span>{this.data.content}</span>
    }
}