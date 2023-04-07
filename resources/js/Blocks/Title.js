import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import AbstrackBlock from "./AbstrackBlock";
import { useState } from "react";


export default class Title extends AbstrackBlock {
    static title = "Titolo"
    static icon = solid('heading')

    getDefaultData() {
        return {
            'content': ''
        }
    }

    mainElementEditable = () => {
        const [content, setContent] = useState(this.data.content)
        const updateContent = (e) => {
            setContent(e.target.value)
            this.updateData({ 'content': e.target.value })
        }

        return <input
            type="text"
            className="w-full text-2xl"
            value={content}
            onChange={updateContent}
            placeholder="Titolo"
        />
    }

    mainElementReadOnly = () => {
        return <h3>
            {this.data.content}
        </h3>
    }
}