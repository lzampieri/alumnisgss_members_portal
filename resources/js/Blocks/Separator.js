import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import AbstrackBlock from "./BlockEnvironment";

export default class Separator extends AbstrackBlock {
    static title = "Separatore"
    static icon = solid('grip-lines')

    static getDefaultData() {
        return {}
    }

    static mainElementEditable = () => {
        return <div className="hseparator"></div>
    }

    static mainElementReadOnly = () => {
        return <div className="hseparator"></div>
    }

}