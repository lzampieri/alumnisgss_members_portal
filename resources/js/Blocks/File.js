import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import AbstrackBlock from "./BlockEnvironment";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EmptyDialog from "../Layout/EmptyDialog";
import FileUploadModal from "./FileUploadModal";


export default class File extends AbstrackBlock {
    static title = "File"
    static icon = solid('file')

    static getDefaultData() {
        return {
            'fileId': null,
            'fileExt': null,
            'title': ""
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        return <div
            className="w-full div-highlighted flex flex-row items-center gap-4 my-2 p-4">
            <FontAwesomeIcon icon={solid('file')} className="text-6xl" />
            <div className="flex flex-col grow gap-2">
                <input
                    type="text"
                    className="w-full"
                    value={item.title}
                    onChange={(e)=> setItemValue('title',e.target.value)}
                    placeholder="Titolo"
                />
                <div><b>Estensione:</b> {item.fileExt}</div>
                <FileUploadModal
                    fileId={item.fileId}
                    setFileId={(newId) => setItemValue('fileId',newId)}
                    setFileExt={(newExt) => setItemValue('fileExt',newExt)}
                    />
            </div>
        </div>
    }

    static mainElementReadOnly = ({item}) => {
        return <div
            className="w-full div-highlighted flex flex-row items-center gap-4 my-2 p-4">
            <FontAwesomeIcon icon={solid('file')} className="text-6xl" />
            <div className="flex flex-col grow gap-2">
                <div className="text-lg">{item.title}</div>
                <div><b>Estensione:</b> {item.fileExt}</div>
            </div>
        </div>
    }
}