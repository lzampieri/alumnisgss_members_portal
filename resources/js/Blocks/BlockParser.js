import { createElement } from "react";
import RegisteredTools from "./RegisteredTools";

export default class BlockParser {

    static render(item, setItemValue, isEditable) {
    
        if (RegisteredTools[item.type] !== undefined) {
    
            if (isEditable)
                return createElement(RegisteredTools[item.type].mainElementEditable, { item: item, setItemValue: setItemValue });
    
            return createElement(RegisteredTools[item.type].mainElementReadOnly, { item: item, setItemValue: setItemValue });
        }
    
        return <label className="error">{ item.type } not defined</label>
    }

    static preProcess(item) {

        if (RegisteredTools[item.type] !== undefined)
            if (RegisteredTools[item.type].preProcess !== undefined)
                return { id: item.id, type: item.type, ...RegisteredTools[item.type].preProcess(item) }

        return item

    }
    
    static postProcess(item) {

        if (RegisteredTools[item.type] !== undefined)
            if (RegisteredTools[item.type].postProcess !== undefined)
                return { id: item.id, type: item.type, ...RegisteredTools[item.type].postProcess(item) }

        return item

    }

}

