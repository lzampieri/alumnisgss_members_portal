import { faGoogleDrive } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import ReactSwitch from "react-switch";

export default class GoogleDriveFolder {
    static title = "Cartella su Google Drive"
    static icon = faGoogleDrive

    static getDefaultData() {
        return {
            'folderId': "",
            'displayAs': "list"
        }
    }

    static parseUrl(url_i) {
        let url = String(url_i)
        if( url.includes('/') ) {
            let mt = url.match(/drive\/folders\/(\w+)/)
            if( mt )
                return mt[1];
            return url.substring( url.lastIndexOf('/') + 1 );
        }
        return url;
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        return <div
            className="w-full div-highlighted flex flex-row items-center gap-4 my-2 p-4">
            <FontAwesomeIcon icon={faGoogleDrive} className="text-6xl" />
            <div className="flex flex-col grow gap-2">
                <input
                    type="text"
                    className="w-full"
                    value={item.folderId}
                    onChange={(e) => setItemValue('folderId', GoogleDriveFolder.parseUrl(e.target.value))}
                    placeholder="ID o URL della cartella"
                />
                <div className="flex flex-row">
                    <ReactSwitch
                        height={14} width={28} className="m-2"
                        checked={item.displayAs == 'grid'} onChange={(newState) => setItemValue('displayAs', item.displayAs == 'grid' ? 'list' : 'grid')}
                    />
                    <p>{item.displayAs == 'grid' ? "Griglia" : "Lista"}</p>
                </div>
            </div>
        </div>
    }

    static mainElementReadOnly = ({ item }) => {
        return <div
            className="w-full">
            <iframe
                src={"https://drive.google.com/embeddedfolderview?id=" + item.folderId + "#" + item.displayAs}
                style={{"width":"100%", "height":"600px", "border":"0"}}></iframe>
        </div>
    }
}