import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import AbstrackBlock from "./BlockEnvironment";
import { useState } from "react";


export default class Title {
    static title = "Titolo"
    static icon = solid('heading')

    static getDefaultData() {
        return {
            content: ''
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        return <input
            type="text"
            className="w-full text-2xl"
            value={item.content}
            onChange={(e)=>setItemValue('content',e.target.value)}
            placeholder="Titolo"
        />
    }

    static mainElementReadOnly = ({ item }) => {
        return <h3>
            {item.content}
        </h3>
    }
}