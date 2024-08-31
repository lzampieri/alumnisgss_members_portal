import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";
import EmptyDialog from "../Layout/EmptyDialog";
import { AlumnusStatus, postRequest, romanize } from "../Utils";
import Dialog from "../Layout/Dialog";

export default function DeleteRatification({ ratifications }) {
    const [selected, setSelected] = useState(null);
    const [processing, setProcessing] = useState(false);


    const submit = () => {
        postRequest(
            'board.remove_ratification',
            { ratification: selected.id },
            setProcessing
        )
        setSelected(null);
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
        <Dialog open={selected}
            onConfirm={submit}
            onClose={() => setSelected(null)}>
            <p>Confermare l'eliminazione della ratifica relativa a {selected && selected.alumnus.name} {selected && selected.alumnus.surname}?</p>
            <p className="text-sm">All'eliminazione, in assenza di ulteriori ratifiche successive riguardanti lo stesso alumno, verrà assegnato lo stato precedente alla ratifica in oggetto ({selected && selected.state_at_document_emission && AlumnusStatus.status[selected.state_at_document_emission].label})</p>
        </Dialog>
        <Backdrop open={processing} />
    </>);
}