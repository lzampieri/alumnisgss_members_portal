import { useDropzone } from "react-dropzone";
import EmptyDialog from "../../Layout/EmptyDialog";
import { useCallback } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { enqueueSnackbar } from "notistack";
import { useForm, usePage } from '@inertiajs/react';
import Backdrop from "../../Layout/Backdrop";


export default function FileUploadModal({ fileHandle, setFileHandle, setFileExt }) {
    const allowed_formats = usePage().props.allowedFormats
    const files = usePage().props.resource.files.sort((a, b) => b.id - a.id)
    const selectedFile = files.find(f => f.handle == fileHandle)
    const [isEditing, setIsEditing] = useState(false)

    const { data, setData, post, processing, reset, errors } = useForm({
        resourceId: usePage().props.resource?.id,
        file: null
    })

    const selectFile = (id) => {
        const newSelectedFile = files.find(f => f.id == id)
        setFileHandle(newSelectedFile.handle)
        setFileExt(newSelectedFile.handle.split('.').pop())
        setIsEditing(false)
    }

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length != 1)
            enqueueSnackbar('È possibile caricare un solo file', { variant: 'error' })

        data.file = acceptedFiles[0]
        post(route('resources.uploadFile'), {
            onSuccess: (page) => {
                if (page.props?.flash?.selectedFileHandle) {
                    setFileHandle(page.props?.flash?.selectedFileHandle)
                    setFileExt(page.props?.flash?.selectedFileExt)
                    setIsEditing(false)
                }
            }
        })
    }, [])
    const { getRootProps, getInputProps } = useDropzone({ onDrop })


    return <>
        <div className="flex flex-row w-full items-center gap-2">
            <i>
                {selectedFile ? selectedFile.handle : "Nessun file selezionato"}
            </i>
            <div className='button' onClick={() => setIsEditing(true)}>{fileHandle ? "Modifica" : "Scegli"}</div>
        </div>
        <EmptyDialog open={isEditing} onClose={() => setIsEditing(false)}>
            <h3>Seleziona file</h3>
            <div {...getRootProps()} className="border-2 border-dashed rounded-md my-4 flex flex-col items-center p-4">
                <input {...getInputProps()} />
                <FontAwesomeIcon icon={solid('file-arrow-up')} className="text-4xl" />
                <div className="text-center">Trascina qui il file da caricare, o clicca per selezionarlo dal pc.</div>
                <label className="error">{errors.file}</label>
                <small>Formati accettati: {allowed_formats.join(", ")}</small>
            </div>
            {files?.length && <i>oppure seleziona un file caricato in precendenza:</i>}
            {
                files?.map(f =>
                    <div className="button" key={f.id} onClick={() => selectFile(f.id)}>
                        {f.handle}<br />
                        <small>Caricato il {new Date(f.created_at).toLocaleString('it-IT')}</small>
                    </div>
                )
            }
        </EmptyDialog>
        <Backdrop open={processing} />
    </>
}