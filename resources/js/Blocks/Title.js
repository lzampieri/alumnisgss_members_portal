import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import AbstrackBlock from "./BlockEnvironment";
import { useState } from "react";


export default class Title {
    static title = "Titolo"
    static icon = solid('heading')

    static getDefaultData() {
        return {
            'content': ''
        }
    }

    static mainElementEditable = ({ item }) => {
        const [content, setContent] = useState(item.content || "")
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

    static mainElementReadOnly = ({ item }) => {
        return <h3>
            {item.content}
        </h3>
    }
}