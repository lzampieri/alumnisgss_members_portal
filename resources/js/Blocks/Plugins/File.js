

import { faFile } from "@fortawesome/free-solid-svg-icons";
import FileUploadModal from "./FileUploadModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default class File {
    static title = "File"
    static icon = faFile

    static getDefaultData() {
        return {
            'fileHandle': null,
            'fileExt': null,
            'title': ""
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        return <div
            className="w-full div-highlighted flex flex-row items-center gap-4 my-2 p-4">
            <FontAwesomeIcon icon={faFile} className="text-6xl" />
            <div className="flex flex-col grow gap-2">
                <input
                    type="text"
                    className="w-full"
                    value={item.title}
                    onChange={(e) => setItemValue('title', e.target.value)}
                    placeholder="Titolo"
                />
                <div><b>Estensione:</b> {item.fileExt}</div>
                <FileUploadModal
                    fileHandle={item.fileHandle}
                    setFileHandle={(newHandle) => setItemValue('fileHandle', newHandle)}
                    setFileExt={(newExt) => setItemValue('fileExt', newExt)}
                />
            </div>
        </div>
    }

    static mainElementReadOnly = ({ item }) => {
        return <a
            className="w-full div-highlighted flex flex-row items-center gap-4 my-2 p-4 no-underline"
            href={item.fileHandle && route('resources.file', { 'handle': item.fileHandle }) + window.location.search}>
            <FontAwesomeIcon icon={faFile} className="text-6xl" />
            <div className="flex flex-col grow gap-2">
                <div className="text-lg">{item.title}</div>
                <div><b>Estensione:</b> {item.fileExt}</div>
            </div>
        </a>
    }
}