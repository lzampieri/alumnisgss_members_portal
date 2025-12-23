import { faGripLines } from "@fortawesome/free-solid-svg-icons"


export default class Separator {
    static title = "Separatore"
    static icon = faGripLines

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