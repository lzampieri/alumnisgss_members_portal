import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useState } from "react";
import TextareaAutosize from 'react-textarea-autosize';

export default class Text {
    static title = "Testo"
    static icon = solid('font')

    static getDefaultData() {
        return {
            content: ''
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        const onChange = (e) => {
            setItemValue('content',e.target.value)
        }

        return <TextareaAutosize
            className="w-full pretendToBeInput"
            minRows={3}
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