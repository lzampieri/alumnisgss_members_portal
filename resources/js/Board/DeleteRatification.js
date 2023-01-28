import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm, usePage } from "@inertiajs/inertia-react";
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";
import EmptyDialog from "../Layout/EmptyDialog";
import { AlumnusStatus, postRequest, romanize } from "../Utils";

export default function DeleteRatification({ ratifications }) {
    const [selected, setSelected] = useState(null);
    const [processing, setProcessing] = useState(false);

    const available_status = usePage().props.available_status;

    const submit = ( new_state ) => {
        postRequest(
            'board.remove_ratification',
            { new_state: new_state, ratification: selected.id },
            setProcessing
            )
        setSelected( null );
    }

    return (<>
        {Object.keys(ratifications).map(k => <div className="grid grid-cols-3" key={k}>
            <label className="col-span-3"><i>Per il passaggio allo stato di <b>{AlumnusStatus.status[k].label}</b></i></label>
            {ratifications[k].map(r =>
                <span key={r.id}>
                    <span className="icon-button" onClick={() => setSelected(r)}><FontAwesomeIcon icon={solid('trash')} /></span>
                    {r.alumnus.surname} {r.alumnus.name}<span className="text-gray-400"> {romanize(r.alumnus.coorte)}{r.alumnus.coorte != 0 && " coorte"}</span>
                </span>
            )}
        </div>)}
        <EmptyDialog open={selected}
            onClose={() => setSelected(null)}>
            <span>Quale stato si vuole assegnare a <b>{ selected && selected.alumnus.name } { selected && selected.alumnus.surname }</b> dopo l'annullamento della ratifica?</span>
            <div className="w-full flex flex-row justify-center flex-wrap">
                { available_status.map( s => 
                    <div className="button" onClick={() => submit( s )} key={s}>
                        { AlumnusStatus.status[s].label }
                    </div>
                )}
            </div>
        </EmptyDialog>
        <Backdrop open={processing} />
    </>);
}