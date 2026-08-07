
import EmptyDialog from "../Layout/EmptyDialog";
import { useState } from "react";

import { postRequest } from "../Utils";
import computeResourceLink from "./computeResourceLink";
import { faAdd, faCopy, faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function MagicLink({ resource, setProcessing }) {
    const [isOpen, setIsOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const enableMagicLink = () => {
        postRequest(
            'resources.magicLink',
            { enabled: true },
            setProcessing,
            { resource: resource.id },
            true
        )
    }

    const disableMagicLink = () => {
        setDeleteOpen(false)
        postRequest(
            'resources.magicLink',
            { enabled: false },
            setProcessing,
            { resource: resource.id },
            true
        )
    }

    return <div className="text-sm text-gray-400">
        {resource.access_token ? <>
            È attivo un magic link per l'accesso alla risorsa <FontAwesomeIcon icon={faInfo} className="ml-2 icon-button" onClick={() => setIsOpen(true)} />
        </> : <>
            Nessun magic link per l'accesso alla risorsa <FontAwesomeIcon icon={faAdd} className="ml-2 icon-button" onClick={() => setIsOpen(true)} />
        </>}
        <EmptyDialog open={isOpen} onClose={() => setIsOpen(false)}>
            <h4>MagicLink</h4>
            <span>I MagicLink permettono a chiunque lo possieda - anche senza eseguire l'accesso - di accedere alla risorsa <b>e a tutte le sue sottorisorse</b>.</span>
            {resource.access_token && <>
                <span>Per questa risorsa è già attivo un magic link.</span>
                <div className="w-full flex flex-row items-center">
                    <input type="text" className="w-full flex-grow" value={computeResourceLink(resource, resource.access_token)} readOnly />
                    <div className="button aspect-square flex flex-col justify-center" onClick={() => navigator.clipboard.writeText(computeResourceLink(resource, resource.access_token))}><FontAwesomeIcon icon={faCopy} /></div>

                </div>
                <div className="button self-center mt-2" onClick={() => setDeleteOpen(true)}>Elimina MagicLink</div>
            </>}
            {resource.access_token == null && <>
                <span>Per questa risorsa non è ancora attivo un magic link.</span>
                <div className="button self-center mt-2" onClick={enableMagicLink}>Attiva MagicLink</div>
            </>}
        </EmptyDialog>
        <EmptyDialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
            <h4>Elimina MagicLink</h4>
            <span>Sei sicuro di voler eliminare il magic link?</span>
            <span>Non <b>potrà più essere recuperato,</b> e tutti coloro che accedevano tramite questo link non potranno più accedere. L'eliminazione è <b>irreversibile</b>: se venisse ricreato, sarebbe diverso dall'attuale.</span>
            <div className="w-full flex flex-row justify-between">
                <div className='button items-end self-end' onClick={() => setDeleteOpen(false)}>Mantieni il magic link</div>
                <div className='button items-end self-end' onClick={disableMagicLink}>Conferma l'eliminazione</div>
            </div>
        </EmptyDialog>
    </div>

}