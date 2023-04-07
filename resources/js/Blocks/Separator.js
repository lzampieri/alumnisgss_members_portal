import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import AbstrackBlock from "./AbstrackBlock";

export default class Separator extends AbstrackBlock {
    static title = "Separatore"
    static icon = solid('grip-lines')

    getDefaultData() {
        return {}
    }

    mainElementEditable = () => {
        return <div className="hseparator"></div>
    }
    
    mainElementReadOnly = () => {
        return <div className="hseparator"></div>
    }

}