import { useDropzone } from "react-dropzone";
import EmptyDialog from "../../Layout/EmptyDialog";
import { useCallback } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { enqueueSnackbar } from "notistack";
import { useForm, usePage } from '@inertiajs/react';
import Backdrop from "../../Layout/Backdrop";
import { flushSync } from "react-dom";


export default function ImageUploadModal({ imageHandle, imageSizeClass, setImageHandle }) {
    const allowed_formats = usePage().props.allowedImagesFormats
    const [isEditing, setIsEditing] = useState(false)

    const { data, setData, post, processing, reset, errors } = useForm({
        resourceId: usePage().props.resource?.id,
        file: null
    })

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length != 1)
            enqueueSnackbar('È possibile caricare un solo file', { variant: 'error' })

        data.file = acceptedFiles[0]
        post(route('resources.uploadImage'), {
            onSuccess: (page) => {
                if (page.props?.flash?.selectedImageHandle) {
                    let ih = page.props?.flash?.selectedImageHandle;
                    setIsEditing(false)
                    setTimeout(() => {
                        setImageHandle(ih);
                    },1000); // Retry to load the image after 1 sec
                }
            }
        })
    }, [])
    const { getRootProps, getInputProps } = useDropzone({ onDrop })


    return <>
        <div className="flex flex-row w-full justify-center gap-2">
            <img src={route('resources.image', { 'handle': imageHandle })} loading="lazy"
                className={imageSizeClass}
            />
        </div>
        <div className='button' onClick={() => setIsEditing(true)}>{imageHandle ? "Modifica" : "Scegli"}</div>
        <EmptyDialog open={isEditing} onClose={() => setIsEditing(false)}>
            <h3>Seleziona immagine</h3>
            <div {...getRootProps()} className="border-2 border-dashed rounded-md my-4 flex flex-col items-center p-4">
                <input {...getInputProps()} />
                <FontAwesomeIcon icon={solid('file-image')} className="text-4xl" />
                <div className="text-center">Trascina qui l'immagine da caricare, o clicca per selezionarlo dal pc.</div>
                <label className="error">{errors.file}</label>
                <small>Formati accettati: {allowed_formats.join(", ")}</small>
            </div>
        </EmptyDialog>
        <Backdrop open={processing} />
    </>
}