import { createElement } from "react";
import PlainText from "./PlainText";
import RegisteredTools from "./RegisteredTools";


export default function BlockParser(item, isEditable) {

    if (RegisteredTools[item.type] !== undefined) {

        if (isEditable)
            return createElement(RegisteredTools[item.type].mainElementEditable, { item: item });

        return createElement(RegisteredTools[item.type].mainElementReadOnly, { item: item });
    }

    return <label className="error">{ item.type } not defined</label>

    // // TODO remove
    // switch (block.type) {
    //     default:
    //         return PlainText(block);
    // }
}