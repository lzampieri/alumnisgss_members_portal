import { useDropzone } from "react-dropzone";
import EmptyDialog from "../Layout/EmptyDialog";
import { useCallback } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { enqueueSnackbar } from "notistack";
import { usePage } from '@inertiajs/react';


export default function FileUploadModal({ fileId }) {
    const allowed_formats = usePage().props.allowedFormats

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length != 1)
            enqueueSnackbar('È possibile caricare un solo file', { variant: 'error' })

        console.log(acceptedFiles)
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const [isEditing, setIsEditing] = useState(true)

    return <>
        <div className="flex flex-row w-full items-center gap-2">
            <i>
                {fileId ? fileId : "Nessun file selezionato"}
            </i>
            <div className='button' onClick={() => setIsEditing(true)}>{fileId ? "Modifica" : "Scegli"}</div>
        </div>
        <EmptyDialog open={isEditing} onClose={() => setIsEditing(false)}>
            <h3>Seleziona file</h3>
            <div {...getRootProps()} className="border-2 border-dashed rounded-md my-4 flex flex-col items-center p-4">
                <input {...getInputProps()} />
                <FontAwesomeIcon icon={solid('file-arrow-up')} className="text-4xl" />
                <div className="text-center">Trascina qui il file da caricare, o clicca per selezionarlo dal pc.</div>
                <small>Formati accettati: {allowed_formats.join(", ")}</small>
            </div>
        </EmptyDialog>
    </>
}