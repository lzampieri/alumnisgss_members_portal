import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default class Link {
    static title = "Link"
    static icon = solid('link')

    static getDefaultData() {
        return {
            'title': "",
            'href': ""
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        return <div
            className="w-full div-highlighted flex flex-row items-center gap-4 my-2 p-4">
            <FontAwesomeIcon icon={solid('globe')} className="text-6xl" />
            <div className="flex flex-col grow gap-2">
                <input
                    type="text"
                    className="w-full"
                    value={item.title}
                    onChange={(e)=> setItemValue('title',e.target.value)}
                    placeholder="Titolo"
                />
                <input
                    type="text"
                    className="w-full"
                    value={item.href}
                    onChange={(e)=> setItemValue('href',e.target.value)}
                    placeholder="Indirizzo web"
                />
            </div>
        </div>
    }

    static mainElementReadOnly = ({item}) => {
        console
        return <a
            className="w-full div-highlighted flex flex-row items-center gap-4 my-2 p-4 no-underline"
            href={ item.href }>
            <FontAwesomeIcon icon={solid('globe')} className="text-6xl" />
            <div className="flex flex-col grow gap-2">
                <div className="text-lg">{item.title}</div>
            </div>
        </a>
    }
}