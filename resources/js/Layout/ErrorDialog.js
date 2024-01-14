import { createPortal } from "react-dom";
import EmptyDialog from './EmptyDialog';
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";


export default function ErrorDialog({ inside }) {
    const [open,setOpen] = useState( true );

    return <EmptyDialog open={open} onClose={() => setOpen(false)}>
        <span className="w-full text-center">
            <FontAwesomeIcon icon={solid('lock')} className="text-4xl text-white bg-primary-main rounded-2xl p-8 " />
        </span>
        <div className="w-full text-center py-8">
            <b>{ inside }</b>
        </div>
        <div className="self-center button" onClick={() => setOpen(false)}>
            Ok
            <FontAwesomeIcon icon={solid('heart-crack')} className="pl-2" />
        </div>
    </EmptyDialog>
}