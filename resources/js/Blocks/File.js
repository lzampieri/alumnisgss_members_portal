import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import AbstrackBlock from "./AbstrackBlock";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default class File extends AbstrackBlock {
    static title = "File"
    static icon = solid('file')

    getDefaultData() {
        return {
            'fileId': -1,
            'fileType': '--',
            'title': ''
        }
    }

    mainElementEditable = () => {
        const [title, setTitle] = useState(this.data.title)
        const [fileId, setFileId] = useState(this.data.fileId)
        const [fileType, setFileType] = useState(this.data.fileType)

        const updateTitle = (e) => {
            setTitle(e.target.value)
            this.updateData({ 'title': e.target.value })
        }

        return <div
            className="w-full div-highlighted flex flex-row items-center gap-4 my-2 p-4">
            <FontAwesomeIcon icon={solid('file')} className="text-6xl" />
            <div className="flex flex-col grow gap-2">
                <input
                    type="text"
                    className="w-full"
                    value={title}
                    onChange={updateTitle}
                    placeholder="Titolo"
                />
                <div><b>Estensione:</b> {fileType}</div>
            </div>
        </div>
    }

    mainElementReadOnly = () => {
        return <div
            className="w-full div-highlighted flex flex-row items-center gap-4 my-2 p-4">
            <FontAwesomeIcon icon={solid('file')} className="text-6xl" />
            <div className="flex flex-col grow gap-2">
                <div className="text-lg">{ this.data.title }</div>
                <div><b>Estensione:</b> { this.data.fileType }</div>
            </div>
        </div>
    }
}