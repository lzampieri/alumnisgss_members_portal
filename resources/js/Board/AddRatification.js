import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm, usePage } from "@inertiajs/inertia-react";
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";
import EmptyDialog from "../Layout/EmptyDialog";
import { AlumnusStatus, postRequest, romanize } from "../Utils";

export default function AddRatification({ document }) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const rats = usePage().props.available_ratifications;

    const submit = ( rat_id ) => {
        postRequest(
            'board.add_ratification',
            { document: document.id, ratification: rat_id },
            setProcessing
        )
    }

    return (<>
        <div className="button self-start mt-4" onClick={() => setOpen(true)}>Associa ratifica</div>
        <EmptyDialog open={open}
            onClose={() => setOpen(false)}>
            { rats.constructor == Object ? <>
                { Object.keys( rats ).map( k => <div className="flex flex-col items-stretch" key={k}>
                    <label className="col-span-3"><i>Per il passaggio allo stato di <b>{ AlumnusStatus.status[k].label }</b></i></label>
                    { rats[k].map( r =>
                        <span key={r.id}>
                            <span className="icon-button" onClick={() => submit( r.id )}><FontAwesomeIcon icon={solid('plus')} /></span>
                            { r.alumnus.surname } { r.alumnus.name } <span className="text-gray-400"> {romanize(r.alumnus.coorte)}{r.alumnus.coorte != 0 && " coorte"}</span>
                        </span>
                    )}
                </div>)}
            </> : <span className="text-error">Nessuna ratifica disponibile</span>}
            <label>Non è possibile creare nuove richieste di ratifica da qui; utilizza l'applicazione dedicata.</label>
        </EmptyDialog>
        <Backdrop open={processing} />
    </>);
}