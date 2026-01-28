import { faHeading } from "@fortawesome/free-solid-svg-icons"



export default class Title {
    static title = "Titolo"
    static icon = faHeading

    static getDefaultData() {
        return {
            content: ''
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        return <input
            type="text"
            className="w-full text-2xl mt-4"
            value={item.content}
            onChange={(e) => setItemValue('content', e.target.value)}
            placeholder="Titolo"
        />
    }

    static mainElementReadOnly = ({ item }) => {
        return <h3 className="mt-4">
            {item.content}
        </h3>
    }
}